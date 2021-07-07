export enum OnboardingScreenName {
  Column,
  Mark,
  Encoding,
}

export interface OnboardingScreenProps {
  onNext: () => void;
  onBack?: () => void;
}
