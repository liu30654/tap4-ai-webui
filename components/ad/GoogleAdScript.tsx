import Script from 'next/script';

import { GOOGLE_ADSENSE_URL } from '@/lib/env';

export default function GoogleAdScript() {
  if (!GOOGLE_ADSENSE_URL) return null;

  return <Script async src={GOOGLE_ADSENSE_URL} crossOrigin='anonymous' />;
}
