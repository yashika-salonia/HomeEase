import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWorkerQueryParams,
  DEFAULT_WORKER_FILTERS,
  formatCurrency,
  formatRate,
  getInitials,
  getTodayIsoDate,
} from './filters';

test('buildWorkerQueryParams omits empty fields and formats active filters', () => {
  assert.deepEqual(buildWorkerQueryParams(DEFAULT_WORKER_FILTERS), {
    sort: 'rating',
  });

  const params = buildWorkerQueryParams({
    q: '  Rekha  ',
    category: 'Cook',
    location: 'Ambala',
    minPrice: '200',
    maxPrice: '600',
    minExperience: '3',
    minRating: '4',
    availableOnly: true,
    sort: 'price_asc',
  });

  assert.deepEqual(params, {
    q: 'Rekha',
    category: 'Cook',
    location: 'Ambala',
    minPrice: '200',
    maxPrice: '600',
    minExperience: '3',
    minRating: '4',
    available: 'true',
    sort: 'price_asc',
  });
});

test('currency and rate formatting render consistent INR values', () => {
  assert.equal(formatCurrency(1200), '₹1,200');
  assert.equal(formatRate(350, 'hourly'), '₹350/hr');
  assert.equal(formatRate(1200, 'daily'), '₹1,200/day');
});

test('getInitials and getTodayIsoDate work deterministically', () => {
  assert.equal(getInitials('Rekha Joshi'), 'RJ');
  assert.equal(getInitials('Harish'), 'HA');
  assert.equal(getTodayIsoDate(new Date(2026, 10, 20)), '2026-11-20');
});
