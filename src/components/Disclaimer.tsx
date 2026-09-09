import { CA_DISCLAIMER } from '../ai/caSystemPrompt';

export const DISCLAIMER_TEXT = CA_DISCLAIMER;

export function Disclaimer() {
  return <p className="disclaimer">{DISCLAIMER_TEXT}</p>;
}
