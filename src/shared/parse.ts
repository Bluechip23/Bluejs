import { Some } from 'monet';
import { padStart } from 'lodash';
import { BluechipCoin } from './types';
import { Coin } from '@cosmjs/proto-signing';

const Long = require('long');

export const parseDecTypeToNumber = (dec: string): number =>
    Some(padStart(dec, 18, '0'))
        .map(dec => `${dec.slice(0, dec.length - 18)}.${dec.slice(-18)}`)
        .map(Number)
        .join();

export const sumBluechipCoins = (coins: BluechipCoin[]): BluechipCoin =>
  coins.reduce((total, coin) => ({
    denom: 'ubluechip',
    amount: total.amount + coin.amount
  }), {
    denom: 'ubluechip',
    amount: 0
  });

export const parseLongCoin = (coin: Coin): BluechipCoin => ({
  denom: 'ubluechip',
  amount: parseDecTypeToNumber(coin.amount)
});


export const parseNumToLong = (num: number): Long => new Long.fromNumber(num);

export const parseStringToLong = (val: string): Long => new Long.fromString(val);


export type ParseFn = ((params: object) => unknown)


export const deepParseLong = (obj: object, paths: string[]): object => {
  const setAtPath = (object: Record<string, unknown>, pathParts: string[]): void => {
    pathParts.reduce((acc: Record<string, unknown>, part, idx, arr) => {
      if (idx === arr.length - 1) {
        if (typeof acc[part] === "string" || typeof acc[part] === "number") {
          acc[part] = parseNumToLong(Number(acc[part]));
        }
      } else {
        acc[part] = acc[part] || {};
      }
      return acc[part] as Record<string, unknown>;
    }, object);
  }

  paths.forEach(path => setAtPath(obj as Record<string, unknown>, path.split('.')));

  return obj;
};


export const scaleTo18 = (num: number) => (num * 1e18).toString();