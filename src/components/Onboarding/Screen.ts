
export enum OnboardingScreenName {
    Column,
    Mark,
    Encoding
}

export interface ScreenProps {
    onNext: () => void,
    onBack?: () => void,
}