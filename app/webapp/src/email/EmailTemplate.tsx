import { Html } from '@react-email/components';
import { Anchor, Box, Heading as GrommetHeading, Image, Text } from 'grommet';
import { t } from 'i18next';
import { Trans } from 'react-i18next';

import { I18Keys } from '../i18n/i18n';
import { PostCard } from '../post/PostCard';
import { NotificationFreq } from '../shared/types/types.notifications';
import { AppPostFull } from '../shared/types/types.posts';
import { AutopostOption } from '../shared/types/types.user';
import { AppButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';

const MAX_POSTS_IN_EMAIL = 3;

export function EmailTemplate(props: {
  posts: AppPostFull[];
  notificationFrequency: NotificationFreq;
  autopostOption: AutopostOption;
}) {
  const { constants } = useThemeContext();
  const { posts } = props;

  const emailSettingsLink = 'https://example.com';
  const reviewPostsLink = 'https://example.com';
  const automationSettingsLink = 'https://example.com';

  const headerTimeframeKey = (() => {
    switch (props.notificationFrequency) {
      case NotificationFreq.Daily:
        return I18Keys.emailHeaderDailyNotificationTimeframe;
      case NotificationFreq.Weekly:
        return I18Keys.emailHeaderWeeklyNotificationTimeframe;
      case NotificationFreq.Monthly:
        return I18Keys.emailHeaderMonthlyNotificationTimeframe;
      default:
        return I18Keys.emailHeaderDailyNotificationTimeframe;
    }
  })();

  const footerTimeframeKey = (() => {
    switch (props.notificationFrequency) {
      case NotificationFreq.Daily:
        return I18Keys.emailFooterDailyNotificationTimeframe;
      case NotificationFreq.Weekly:
        return I18Keys.emailFooterWeeklyNotificationTimeframe;
      case NotificationFreq.Monthly:
        return I18Keys.emailFooterMonthlyNotificationTimeframe;
      default:
        return I18Keys.emailFooterDailyNotificationTimeframe;
    }
  })();

  const { header, footer } = (() => {
    if (props.autopostOption === AutopostOption.MANUAL) {
      return {
        header: t(I18Keys.recommendedNanopubEmailHeader, {
          count: posts.length,
          timeframe: t(headerTimeframeKey),
        }),
        footer: (
          <Trans
            i18nKey={I18Keys.recommendedNanopubEmailFooter}
            components={{
              emailSettingsLink: <Anchor href={emailSettingsLink} />,
              reviewPostsLink: <Anchor href={reviewPostsLink} />,
            }}
            values={{ timeframe: t(footerTimeframeKey) }}
          />
        ),
      };
    } else {
      return {
        header: t(I18Keys.publishedNanopubEmailHeader, {
          count: posts.length,
          timeframe: t(headerTimeframeKey),
        }),
        footer: (
          <Trans
            i18nKey={I18Keys.publishedNanopubEmailFooter}
            components={{
              automationSettingsLink: <Anchor href={automationSettingsLink} />,
              reviewPostsLink: <Anchor href={reviewPostsLink} />,
            }}
            values={{ timeframe: t(footerTimeframeKey) }}
          />
        ),
      };
    }
  })();

  return (
    <Html lang="en">
      <Box
        align="center"
        pad="large"
        style={{ backgroundColor: constants.colors.shade }}>
        <Box align="center" pad={{ bottom: 'medium' }}>
          <Box
            width="80px"
            height="80px"
            round="full"
            background="white"
            align="center"
            justify="center"
            margin={{ bottom: 'medium' }}>
            <Image
              src="/icons/logo.png"
              alt="Logo"
              width="50px"
              height="50px"
            />
          </Box>
          <GrommetHeading level="2" margin="medium">
            {header}
          </GrommetHeading>
        </Box>

        {posts.slice(0, MAX_POSTS_IN_EMAIL).map((post) => (
          <Box
            key={post.id}
            margin={{ bottom: 'medium' }}
            align="center"
            width={{ max: '600px' }}>
            <PostCard key={post.id} post={post} handleClick={() => {}} />
            <Box align="center" margin="medium" width="auto">
              <AppButton
                primary
                label="Review Post"
                onClick={() => {}}
                margin={{ top: 'medium' }}
              />
            </Box>
          </Box>
        ))}
        {posts.length > MAX_POSTS_IN_EMAIL && (
          <>
            <Text size="medium" margin={{ top: 'medium' }}>
              {`+${posts.length - MAX_POSTS_IN_EMAIL} more post${posts.length - MAX_POSTS_IN_EMAIL > 1 ? '1' : ''}`}
            </Text>
            <Box align="center" margin={{ top: 'medium' }} width="auto">
              <AppButton
                primary
                label="See All"
                onClick={() => {}}
                margin={{ top: 'medium' }}
              />
            </Box>
            <Box width={{ max: '800px' }}>
              <Text
                size="small"
                margin={{
                  top: 'medium',
                }}>
                {footer}
              </Text>
            </Box>
          </>
        )}
      </Box>
    </Html>
  );
}