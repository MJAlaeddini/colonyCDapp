import React from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

import Heading, { Appearance as HeadingAppearance } from '~shared/Heading';
import { SimpleMessageValues } from '~types';

import SpinnerLoader, { Appearance } from './SpinnerLoader';
import styles from './MiniSpinnerLoader.css';

interface Props {
  appearance?: Appearance;
  titleAppearance?: HeadingAppearance;
  title?: string | MessageDescriptor;
  /** Values for text (react-intl interpolation) */
  titleTextValues?: SimpleMessageValues;
  loadingText?: string | MessageDescriptor;
  className?: string;
  loadingTextClassName?: string;
}

const MiniSpinnerLoader = ({
  appearance,
  titleAppearance = { size: 'normal', weight: 'bold' },
  title,
  titleTextValues,
  loadingText,
  className,
  loadingTextClassName,
}: Props) => {
  return (
    <div className={className}>
      {title && (
        <Heading
          text={title}
          textValues={titleTextValues}
          appearance={titleAppearance}
        />
      )}
      <SpinnerLoader appearance={appearance} />
      {loadingText &&
        (typeof loadingText === 'string' ? (
          loadingText
        ) : (
          <span className={loadingTextClassName || styles.loadingText}>
            <FormattedMessage {...loadingText} />
          </span>
        ))}
    </div>
  );
};

export default MiniSpinnerLoader;
