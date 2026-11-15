import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('live Sun data', () => {
  it('uses the saved snapshot when DONKI is unavailable', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetch);
    const { fetchRealSun } = await import('../src/data/liveSun.js');

    const first = await fetchRealSun();
    const second = await fetchRealSun();
    expect(first).toMatchObject({
      status: 'fallback',
      source: 'snapshot',
      text: expect.any(String),
    });
    expect(second).toEqual(first);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('caches a successful result for repeated calls', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        classType: 'M2.4',
        peakTime: '2026-11-12T10:20:00Z',
        flrID: 'test-flare',
        link: 'https://api.nasa.gov/test-flare',
      }],
    });
    vi.stubGlobal('fetch', fetch);
    const { fetchRealSun } = await import('../src/data/liveSun.js');

    const first = await fetchRealSun();
    const second = await fetchRealSun();

    expect(first).toMatchObject({
      status: 'ok',
      source: 'live',
      flareClass: 'M2.4',
      date: 'Nov 12',
    });
    expect(second).toEqual(first);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0].toString()).toContain('/DONKI/FLR');
    expect(fetch.mock.calls[0][0].toString()).toContain('startDate=');
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });
});
