import { Anchor, Box, Text } from 'grommet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { I18Keys } from '../i18n/i18n';
import { AppButton, AppCard, AppSectionHeader } from '../ui-components';
import { useNanopubContext } from './contexts/platforms/NanopubContext';
import { useTwitterContext } from './contexts/platforms/TwitterContext';

export const AppPlatformManager = (props: {}) => {
  const { t } = useTranslation();
  const {
    connect: connectTwitter,
    revokeApproval: revokeTwitter,
    isConnecting: isConnectingTwitter,
    isApproving: isApprovingTwitter,
    needConnect: needConnectTwitter,
  } = useTwitterContext();

  const {
    connect: connectNanopub,
    isConnecting: isConnectingNanopub,
    needAuthorize: needAuthorizeNanopub,
  } = useNanopubContext();

  return (
    <Box fill>
      <AppCard>
        <Text>{t(I18Keys.platformManagerOverview)}</Text>
      </AppCard>

      <Box margin={{ top: 'large' }}>
        <AppSectionHeader level="4">
          {t(I18Keys.connectTwitter)}
        </AppSectionHeader>

        <AppCard margin={{ top: 'medium' }}>
          <Text>{t(I18Keys.connectTwitterOverview)}</Text>
        </AppCard>

        <Box direction="row" gap="small" margin={{ top: 'medium' }}>
          <AppButton
            style={{ width: '50%' }}
            primary
            disabled={!needConnectTwitter}
            loading={isConnectingTwitter}
            onClick={() => {
              if (connectTwitter) {
                connectTwitter('read');
              }
            }}
            label={t(I18Keys.connectTwitterBtn)}></AppButton>

          <AppButton
            style={{ width: '50%' }}
            primary
            disabled={!needConnectTwitter}
            loading={isApprovingTwitter}
            onClick={() => {
              if (connectTwitter) {
                connectTwitter('write');
              }
            }}
            label={t(I18Keys.approveTwitterBtn)}></AppButton>
        </Box>

        {!needConnectTwitter ? (
          <AppCard margin={{ top: 'small' }}>
            <Text>
              <Anchor
                onClick={(e) => {
                  e.preventDefault();
                  revokeTwitter();
                }}>
                revoke
              </Anchor>{' '}
              posting approval.
            </Text>
          </AppCard>
        ) : (
          <></>
        )}
      </Box>

      <Box margin={{ top: 'large' }}>
        <AppSectionHeader level="4">{t('connectNanopub')}</AppSectionHeader>
        <AppButton
          margin={{ vertical: 'small' }}
          primary
          disabled={!needAuthorizeNanopub}
          loading={isConnectingNanopub}
          onClick={() => connectNanopub()}
          label={
            needAuthorizeNanopub
              ? t('connectNanopubBtn')
              : t('nanopubConnected')
          }></AppButton>
      </Box>
    </Box>
  );
};
