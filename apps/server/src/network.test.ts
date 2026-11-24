import { describe, expect, it } from 'vitest';
import { isPublicAddress } from './network.ts';

describe('isPublicAddress', () => {
  it('allows public IPv4 and IPv6 addresses', () => {
    for (const address of [
      '93.184.216.34',
      '8.8.8.8',
      '1.1.1.1',
      '172.15.255.255',
      '172.32.0.1',
      '100.63.255.255',
      '2606:4700:4700::1111',
      '2a00:1450:4001:82a::200e',
      '::ffff:93.184.216.34',
      '64:ff9b::808:808',
      '2002:5db8:d822::1',
    ]) {
      expect(isPublicAddress(address), address).toBe(true);
    }
  });

  it('refuses this machine, private networks and reserved ranges', () => {
    for (const address of [
      '0.0.0.0',
      '127.0.0.1',
      '10.1.2.3',
      '100.64.0.1',
      '169.254.169.254',
      '172.16.0.1',
      '172.31.255.255',
      '192.168.1.1',
      '192.0.2.10',
      '198.18.0.1',
      '224.0.0.1',
      '255.255.255.255',
      '::',
      '::1',
      'fe80::1%eth0',
      'fd00::1',
      'fc00::1',
      'ff02::1',
      '::ffff:127.0.0.1',
      '::ffff:7f00:1',
      '64:ff9b::a00:1',
      '2002:c0a8:101::1',
      '2001:db8::1',
      '2001:0:4136:e378::1',
      '3fff::1',
      '100::1',
    ]) {
      expect(isPublicAddress(address), address).toBe(false);
    }
  });

  it('refuses text that is not an IP address', () => {
    expect(isPublicAddress('example.com')).toBe(false);
    expect(isPublicAddress('')).toBe(false);
  });
});
