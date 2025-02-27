import React, { useRef } from 'react';
import { MessageDescriptor, FormattedMessage } from 'react-intl';
import { nanoid } from 'nanoid';
import classnames from 'classnames';
import { useFormContext } from 'react-hook-form';

import { getMainClasses } from '~utils/css';
import Icon from '~shared/Icon';
import { UniversalMessageValues } from '~types';

import styles from './CustomRadio.css';

export interface Appearance {
  theme?: 'primary' | 'danger' | 'greyWithCircle';
  direction?: 'horizontal' | 'vertical';
}

export interface Props {
  /** Appearance object */
  appearance?: Appearance;
  /** Disable the input */
  disabled?: boolean;
  /** HTML input value */
  value: string | number;
  /** Label text */
  label: string | MessageDescriptor;
  /** Description text values for intl interpolation */
  labelValues?: UniversalMessageValues;
  /** Button description */
  description?: string | MessageDescriptor;
  /** Description text values for intl interpolation */
  descriptionValues?: UniversalMessageValues;
  /** Button icon */
  icon?: string;
  /** If the input is checked */
  checked: boolean;
  /** Radio button name attribute */
  name: string;
  /** Html input `id` attribute */
  inputId?: string;
  /** Provides value for data-test used on cypress testing */
  dataTest?: string;
}

const displayName = 'CustomRadio';

const CustomRadio = ({
  disabled,
  value,
  label,
  labelValues,
  checked,
  name,
  inputId,
  appearance = { theme: 'primary' },
  description,
  descriptionValues,
  icon,
  dataTest,
}: Props) => {
  const { setValue, getFieldState } = useFormContext();
  const { error } = getFieldState(name);
  const inputRef = useRef<string>(inputId || nanoid());

  return (
    <label
      className={getMainClasses(appearance, styles, {
        isChecked: checked,
        isDisabled: !!disabled,
      })}
      htmlFor={inputRef.current}
    >
      {appearance.theme === 'greyWithCircle' && (
        <div
          className={classnames(styles.customRadioIcon, {
            [styles.checkedCustomRadioIcon]: checked,
          })}
        >
          {checked && <div className={styles.customRadioCheck} />}
        </div>
      )}
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <input
        aria-checked={checked}
        aria-disabled={disabled}
        aria-invalid={!!error}
        disabled={disabled}
        type="radio"
        value={value}
        onClick={() =>
          setValue(name, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }
        name={name}
        id={inputRef.current}
        className={styles.input}
        data-test={dataTest}
      />
      {icon && (
        <div className={styles.icon}>
          <Icon appearance={{ size: 'medium' }} name={icon} title={icon} />
        </div>
      )}
      <div className={styles.content}>
        {label && (
          <span className={styles.label}>
            {typeof label === 'string' ? (
              label
            ) : (
              <FormattedMessage {...label} values={labelValues} />
            )}
          </span>
        )}
        {description && (
          <span className={styles.description}>
            {typeof description === 'string' ? (
              description
            ) : (
              <FormattedMessage {...description} values={descriptionValues} />
            )}
          </span>
        )}
      </div>
    </label>
  );
};

CustomRadio.displayName = displayName;

export default CustomRadio;
