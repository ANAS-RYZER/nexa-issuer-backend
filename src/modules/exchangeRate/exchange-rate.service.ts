import { Injectable, Logger, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Model } from "mongoose";
import axios from "axios";
import {
  ExchangeRate,
  ExchangeRateDocument,
} from "./schemas/exchange-rate.schema";

const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes in seconds
const CACHE_KEY = "exchange_rates";
const CACHE_TTL = 50 * 60; // 50 minutes in seconds

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  private ratesCache: Record<string, number> = {
    USD: 1,
    INR: 89.44,
    AED: 3.67,
    GBP: 0.79,
    QAR: 3.64,
  };

  private lastFetchTime = 0;
  private readonly API: string;

  constructor(
    @InjectModel(ExchangeRate.name)
    private readonly rateModel: Model<ExchangeRateDocument>,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    const key = this.config.get<string>("EXCHANGE_RATE_API_KEY");
    this.API = `https://openexchangerates.org/api/latest.json?app_id=${key}`;
  }

  /* ================= LOAD FROM DB ================= */
  async loadFromDB() {
    const stored = await this.rateModel.findOne({ currency: "USD" });

    if (stored) {
      this.ratesCache = Object.fromEntries(stored.rates);
      this.lastFetchTime = stored.lastUpdated.getTime();
      this.logger.log("Rates loaded from DB");
    }
  }

  /* ================= FETCH FROM API ================= */
  async fetchRates() {
    const now = Date.now();

    // Check cache first
    const cached: any = await this.cache.get(CACHE_KEY);
    if (cached) {
      this.ratesCache = cached.rates;
      this.lastFetchTime = cached.lastFetchTime;
      return;
    }

    if (now - this.lastFetchTime < CACHE_DURATION) return;

    await this.loadFromDB();
    if (now - this.lastFetchTime < CACHE_DURATION) {
      await this.cache.set(
        CACHE_KEY,
        {
          rates: this.ratesCache,
          lastFetchTime: this.lastFetchTime,
        },
        CACHE_TTL,
      );
      return;
    }

    //API call
    const response = await axios.get(this.API);
    const data = response.data;

    if (!data || !data.rates) {
      this.logger.error("Invalid exchange API response structure");
      return;
    }

    this.ratesCache = data.rates;
    this.lastFetchTime = Date.now();

    await this.rateModel.findOneAndUpdate(
      { currency: "USD" },
      {
        currency: "USD",
        rates: new Map(Object.entries(data.rates)),
        lastUpdated: new Date(),
      },
      { upsert: true },
    );

    //store in cache for 50 mins
    await this.cache.set(
      CACHE_KEY,
      {
        rates: this.ratesCache,
        lastFetchTime: this.lastFetchTime,
      },
      CACHE_TTL,
    );

    this.logger.log("Exchange rates updated");
  }

  /* ================= CONVERSION ================= */
  async convert(from: string, to: string, amount: number) {
    if (from === to) return amount;

    await this.fetchRates();

    const sourceRate = this.ratesCache[from] ?? this.ratesCache["INR"];
    const targetRate = this.ratesCache[to] ?? this.ratesCache["INR"];

    const usd = amount / sourceRate;
    return usd * targetRate;
  }

  /* ================= GET RATES ================= */
  getRates() {
    return this.ratesCache;
  }
}
