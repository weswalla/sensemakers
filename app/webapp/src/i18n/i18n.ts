import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export enum I18Keys {
  introTitle = 's005',
  introSubtitle = 's006',
  introParagraph1 = 's007',
  introParagraph2 = 's008',
  emailInputBtn = 's0095',

  connectSocialsTitle = 's0090',
  connectSocialsParagraph = 's0091',
  connectSocialsParagraph2 = 's0092',
  signInX = 's012',

  connectAccounts = 's010',
  connectParagraph = 's011',
  errorConnectTwitter = 's013',
  yourPublications = 's014',
  TweetX = 's015',
  ThreadX = 's016',
  addKeyword = 's017',
  profile = 's018',
  updateAvailable = 's019',
  updateNow = 's020',
  installPrompt = 's021',
  installNow = 's022',
  noMorePosts = 's023',
  settings = 's024',
  logout = 's025',

  drafts = 's026',

  introNextLabel = 's026x',
  introFinalLabel = 's026y',

  introHeading01 = 's027',
  introText011 = 's028',
  introText012 = 's029',

  introHeading02 = 's0272',
  introText021 = 's0282',
  introText022 = 's0292',

  introHeading03 = 's0273',
  introText031 = 's0283',
  introText032 = 's0293',

  ignore = 's031',
  publish = 's030',
  postsNames = 's032xc',

  connectOrcidTitle = 's032',
  connectOrcidPar01 = 's033',
  connectOrcidPar02 = 's034',
  connectOrcid = 's035',
  continue = 's036',

  publishWarningTitle = 's0320',
  publishWarningPar01 = 's0331',
  publishWarningPar02 = 's0342',
  publishWarningPar03 = 's0353c',

  returnToDraft = 's0353',
  yesPublish = 's0364',

  publishing = 's0365',

  publishedTitle = 's0366',
  publishedText = 's0367',
  nextPost = 's0368',
  openPublished = 's0369',

  edit = 's037',
  retract = 's038',

  cancel = 's039',

  recommendedNanopubEmailHeader = 's040',
  recommendedNanopubEmailHeaderSingular = 's040_one',
  recommendedNanopubEmailHeaderPlural = 's040_other',

  recommendedNanopubEmailFooter = 's041',

  publishedNanopubEmailHeader = 's042',
  publishedNanopubEmailHeaderSingular = 's042_one',
  publishedNanopubEmailHeaderPlural = 's042_other',

  publishedNanopubEmailFooter = 's043',

  emailHeaderDailyNotificationTimeframe = 's044',
  emailHeaderWeeklyNotificationTimeframe = 's045',
  emailHeaderMonthlyNotificationTimeframe = 's046',
  emailFooterDailyNotificationTimeframe = 's047',
  emailFooterWeeklyNotificationTimeframe = 's048',
  emailFooterMonthlyNotificationTimeframe = 's049',

  emailReviewPostButton = 's050',
  emailSeeAllButton = 's051',
  emailMorePostsNote = 's052',
  emailMorePostsNoteSingular = 's052_one',
  emailMorePostsNotePlural = 's052_other',

  copyright = 's053',

  downloads = 's054',
  installApp = 's055c',

  usingApp = 's055',
  publishingAutomation = 's056',
  notificationsSettings = 's057',
  getSupport = 's058',

  yourAccounts = 's059',
  XTwitter = 's060c',
  emailAddress = 's060',
  ORCID = 's061',
}

const check = new Set();
for (let entry of Object.entries(I18Keys)) {
  if (check.has(entry[1]))
    throw new Error(`repeated value ${entry[1]} for I18Keys key ${entry[0]}`);
  check.add(entry[1]);
}

const translationENG: Record<I18Keys, string> = {
  [I18Keys.introTitle]: 'Your ideas matter again',
  [I18Keys.introSubtitle]:
    'Transform your social media activity into meaningful scientific contributions',
  [I18Keys.introParagraph1]:
    'Social media posts are a valuable source of scientific knowledge, but they get buried in noisy feeds and locked away by platforms.',
  [I18Keys.introParagraph2]:
    'Harness this knowledge by converting your social media posts into nanopublications, making your content <b>FAIR</b> (<b>F</b>indable, <b>A</b>ccessible, <b>I</b>nteroperable and <b>R</b>eusable), so your contributions can get proper recognition',
  [I18Keys.emailInputBtn]: 'Get started',

  [I18Keys.connectSocialsTitle]: 'Connect your socials',
  [I18Keys.connectSocialsParagraph]:
    'Link your X·Twitter account to start transforming your tweets into nanopublications.',
  [I18Keys.connectSocialsParagraph2]:
    'By connecting, you can easily identify and FAIRify your valuable scientific insights.',
  [I18Keys.signInX]: 'Sign in with X',

  [I18Keys.drafts]: 'Drafts',

  [I18Keys.introNextLabel]: 'Next Tip',
  [I18Keys.introFinalLabel]: 'Let’s nanopublish!',

  [I18Keys.introHeading01]: 'We’re finding your science posts',
  [I18Keys.introText011]:
    'Our AI is scanning your latest X · Twitter posts to identify and tag your science-related content.  These tags make your posts machine-readable, enhancing their discoverability and usability. ',
  [I18Keys.introText012]:
    'The posts tagged as "For Review" are those our AI recommends for nanopublishing.',

  [I18Keys.introHeading02]: 'Nanopublish your research and recommendations ',
  [I18Keys.introText021]:
    'All your research-related posts make valuable nanopublications!',
  [I18Keys.introText022]:
    "Posts mentioning references with a DOI are perfect candidates, but don't stop there. Consider sharing research ideas, conference highlights, grant information, or job opportunities as well.",

  [I18Keys.introHeading03]: 'We’ve got you covered!',
  [I18Keys.introText031]:
    "As you continue posting on X · Twitter, we'll monitor your feed for relevant content to ensure your future research remains FAIR and under your control.",
  [I18Keys.introText032]:
    'You can adjust your notification and publishing automation settings anytime in your preferences.',

  [I18Keys.connectAccounts]: 'Connect your accounts',
  [I18Keys.connectParagraph]:
    'SenseNet loads your X (Twitter) feed and analyzes your posts using AI to deduct keywords and relations, which can be used to better interpret the meaning of your content.',
  [I18Keys.errorConnectTwitter]: 'Error connecting Twitter',
  [I18Keys.yourPublications]: 'Your publications',
  [I18Keys.TweetX]: 'X · Tweet',
  [I18Keys.ThreadX]: 'X · Thread',
  [I18Keys.addKeyword]: 'add keyword',
  [I18Keys.profile]: 'Profile',
  [I18Keys.updateAvailable]: 'An update is available, ',
  [I18Keys.updateNow]: 'update now',
  [I18Keys.installPrompt]: 'Please install this app, ',
  [I18Keys.installNow]: 'install',
  [I18Keys.noMorePosts]: 'No more posts to show',
  [I18Keys.settings]: 'Settings',
  [I18Keys.logout]: 'Logout',

  [I18Keys.ignore]: 'Ignore',
  [I18Keys.publish]: 'Nanopublish',
  [I18Keys.postsNames]: 'Nanopubs',

  [I18Keys.connectOrcidTitle]: 'Your data, your identity',
  [I18Keys.connectOrcidPar01]:
    'Your nanopublications are owned by you and tied to your identity through cryptographic signing. You’ll sign these nanopubs with a wallet we created for you using your email. ',
  [I18Keys.connectOrcidPar02]:
    'If you want, you can also <b>connect your ORCID</b> account to link your nanopubs to your professional profile, enhancing your recognition within the scientific community.',
  [I18Keys.connectOrcid]: 'Connect ORCID',
  [I18Keys.continue]: 'Continue',

  [I18Keys.publishWarningTitle]: 'Share your research',
  [I18Keys.publishWarningPar01]:
    'Are you ready to publish this nanopublication?',
  [I18Keys.publishWarningPar02]:
    'Once published, your nanopub will be added to the decentralized nanopublications network, making your research accessible and verifiable. ',
  [I18Keys.publishWarningPar03]:
    'While you can retract a nanopub to make it invisible to most users, <b>it cannot be deleted</b>. This ensures the integrity of the scientific record.',
  [I18Keys.returnToDraft]: 'No, return to draft',
  [I18Keys.yesPublish]: 'Yes, I want to publish',

  [I18Keys.publishing]: 'Publishing',

  [I18Keys.publishedTitle]: 'Your nanopublication is live!',
  [I18Keys.publishedText]: 'Your post has been nanopublished.',
  [I18Keys.nextPost]: 'Next post for review',
  [I18Keys.openPublished]: 'See live nanopublication',

  [I18Keys.edit]: 'Edit',
  [I18Keys.retract]: 'Retract',
  [I18Keys.cancel]: 'Cancel',

  [I18Keys.recommendedNanopubEmailHeader]: '',
  [I18Keys.recommendedNanopubEmailHeaderSingular]:
    'You have {{count}} potential nanopublication ready for review {{timeframe}}.',
  [I18Keys.recommendedNanopubEmailHeaderPlural]:
    'You have {{count}} potential nanopublications ready for review {{timeframe}}.',
  [I18Keys.recommendedNanopubEmailFooter]:
    "This is your {{timeframe}} nanopub recommendation summary. You can [edit your email settings here]({{emailSettingsLink}}). Don't see a post you'd like to nanopublish? [Review all your recent posts here]({{ignoredPostsLink}}).",

  [I18Keys.publishedNanopubEmailHeader]: '',
  [I18Keys.publishedNanopubEmailHeaderSingular]:
    "We've automatically published {{count}} post {{timeframe}}.",
  [I18Keys.publishedNanopubEmailHeaderPlural]:
    "We've automatically published {{count}} posts {{timeframe}}.",
  [I18Keys.publishedNanopubEmailFooter]:
    'These posts were automatically published according to your automation settings. You can [change your automation settings here]({{automationSettingsLink}}).\n\nSee any mistakes in your nanopublications? [Edit or retract your automated nanopublications here]({{publishedPostsLink}}).',

  [I18Keys.emailHeaderDailyNotificationTimeframe]: 'today',
  [I18Keys.emailHeaderWeeklyNotificationTimeframe]: 'this week',
  [I18Keys.emailHeaderMonthlyNotificationTimeframe]: 'this month',

  [I18Keys.emailFooterDailyNotificationTimeframe]: 'daily',
  [I18Keys.emailFooterWeeklyNotificationTimeframe]: 'weekly',
  [I18Keys.emailFooterMonthlyNotificationTimeframe]: 'monthly',

  [I18Keys.emailReviewPostButton]: 'Review Post',
  [I18Keys.emailSeeAllButton]: 'See All',

  [I18Keys.emailMorePostsNote]: '',
  [I18Keys.emailMorePostsNoteSingular]: '+{{count}} more post',
  [I18Keys.emailMorePostsNotePlural]: '+{{count}} more posts',

  [I18Keys.copyright]: 'Copyright © 2024',

  [I18Keys.downloads]: 'Downloads',
  [I18Keys.installApp]: 'Install application on your device',

  [I18Keys.usingApp]: 'Using Senscast',
  [I18Keys.publishingAutomation]: 'Publishing Automation',
  [I18Keys.notificationsSettings]: 'Notification Settings',
  [I18Keys.getSupport]: 'Get Support',
  [I18Keys.yourAccounts]: 'Your Accounts',
  [I18Keys.XTwitter]: 'X · Twitter',
  [I18Keys.emailAddress]: 'Email Address',
  [I18Keys.ORCID]: 'ORCID',
};

i18n.use(initReactI18next).init({
  resources: {
    ENG: {
      translation: translationENG,
    },
  },
  lng: 'ENG', // default language
  fallbackLng: 'ENG',

  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
