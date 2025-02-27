import { Address } from '~types';
import { ADDRESS_ZERO, isDev } from '~constants';
import { createAddress } from '~utils/web3';

export enum SlotKey {
  Metatransactions = 'metatransactions',
  DecentralizedMode = 'decentralizedModeEnabled',
  CustomRPC = 'customRpc',
}

export interface UserSettingsSlot {
  [SlotKey.Metatransactions]: boolean;
  [SlotKey.DecentralizedMode]: boolean;
  [SlotKey.CustomRPC]: string;
}

const defaultSlotValues: UserSettingsSlot = {
  /*
   * If on local dev, metatransactions are disabled by default on your user profile
   * In production however, they will be enabled by default
   */
  metatransactions: !isDev,
  decentralizedModeEnabled: false,
  customRpc: '',
};

/**
 * @class UserSettings
 *
 * Basic singleton that handles all the user's settings stored in local storage
 */
class UserSettings {
  slot: string = ADDRESS_ZERO;

  currentSettings: UserSettingsSlot;

  constructor(userAddress?: Address) {
    this.slot = createAddress(userAddress || ADDRESS_ZERO).replace('0x', '');
    this.currentSettings = this.getStorageSlot() as UserSettingsSlot;
    if (!this.currentSettings) {
      this.currentSettings = defaultSlotValues;
      this.setStorageSlot(this.currentSettings);
    }
  }

  /**
   * @NOTE We're using named getter and setters as opposed as the built-in ones
   *
   * Ie: set getStorageSlot() { ... }
   * Because otherwise we would need to jump through various hoops in or\der to
   * call the setter from a redux saga.
   * So in order to cut down on code boilerplate, we're just doing this
   */
  getStorageSlot = (): UserSettingsSlot | null =>
    JSON.parse(localStorage.getItem(this.slot) as string);

  setStorageSlot = (slotValue: UserSettingsSlot): string | null => {
    if (slotValue) {
      const value = JSON.stringify(slotValue);
      localStorage.setItem(this.slot, value);
      return value;
    }
    return null;
  };

  clearStorageSlot = (): boolean => {
    localStorage.removeItem(this.slot);
    return true;
  };

  getSlotStorageAtKey = <K extends SlotKey>(
    slotKey: K,
  ): UserSettingsSlot[K] | null => {
    if (slotKey && this.currentSettings[slotKey]) {
      return this.currentSettings[slotKey];
    }
    return null;
  };

  setSlotStorageAtKey = <K extends SlotKey>(
    slotKey: K,
    value: UserSettingsSlot[K],
  ): UserSettingsSlot[K] | null => {
    if (slotKey && (typeof value !== 'undefined' || value !== null)) {
      this.currentSettings[slotKey] = value;
      localStorage.setItem(this.slot, JSON.stringify(this.currentSettings));
    }
    return null;
  };
}

export default UserSettings;
