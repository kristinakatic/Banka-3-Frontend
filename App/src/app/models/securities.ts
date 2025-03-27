export interface Securities {

  type: string;
  ticker: string;
  amount: number;
  price: number;
  profit: number;
  lastModified: string;
  publicCounter: number;

  settlementDate?: Date;
  strikePrice?: number;
  underlyingStockPrice?: number;
  optionType?: string;
}
