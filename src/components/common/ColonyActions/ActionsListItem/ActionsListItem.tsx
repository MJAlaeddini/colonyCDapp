import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Placement } from '@popperjs/core';

import UserAvatar from '~shared/UserAvatar';
import ListItem, { ListItemStatus } from '~shared/ListItem';
import { ColonyAction } from '~types';
import { useColonyContext } from '~hooks';
import {
  MotionState,
  useShouldDisplayMotionCountdownTime,
} from '~utils/colonyMotions';

import CountDownTimer from '../CountDownTimer';
import { getActionTitleValues } from '../helpers';
import ActionsListItemMeta from './ActionsListItemMeta';
import { useColonyMotionState, useMotionTag } from './helpers';

const displayName = 'common.ColonyActions.ActionsListItem';

const userAvatarPopoverOptions = {
  showArrow: false,
  placement: 'bottom-start' as Placement,
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [-20, 10],
      },
    },
  ],
};

interface Props {
  item: ColonyAction;
}

const ActionsListItem = ({
  item: {
    fromDomain,
    transactionHash,
    // commentCount = 0,
    // status = ListItemStatus.Defused,
    createdAt,
    isMotion,
    motionData,
  },
  item,
}: Props) => {
  const { colony } = useColonyContext();
  const navigate = useNavigate();

  if (!colony) {
    return null;
  }

  const handleActionRedirect = () =>
    navigate(`/colony/${colony?.name}/tx/${transactionHash}`);

  const status = ListItemStatus.Defused;

  const { motionState, refetchMotionState } = useColonyMotionState(
    isMotion,
    motionData,
    transactionHash,
  );

  const MotionTag = useMotionTag(isMotion, motionState);
  const showMotionCountdownTimer =
    useShouldDisplayMotionCountdownTime(motionState);

  return (
    <ListItem
      avatar={
        <UserAvatar
          size="s"
          user={item.initiatorUser}
          showInfo
          popperOptions={userAvatarPopoverOptions}
        />
      }
      createdAt={createdAt}
      extra={
        showMotionCountdownTimer &&
        motionData && (
          <CountDownTimer
            motionState={motionState as MotionState} // safe casting: if motionState is null, showMotionCountdownTimer will be false.
            motionId={motionData.motionId}
            motionStakes={motionData.motionStakes}
            refetchMotionState={refetchMotionState}
          />
        )
      }
      meta={<ActionsListItemMeta fromDomain={fromDomain ?? undefined} />}
      onClick={handleActionRedirect}
      status={status}
      tag={<MotionTag />}
      title={{ id: 'action.title' }}
      titleValues={getActionTitleValues(item, colony)}
    />
  );
};

ActionsListItem.displayName = displayName;

export default ActionsListItem;
