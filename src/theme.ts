const theme = {
  color: {
    text: ['#000'],
    background: ['#fff', '#F6F6F6'],
    primary: {
      dark: '#771C79',
      standard: '#AD77AF',
      light: '#E4D2E4',
    },
    pill: ['#E5F2DE', '#F5DFDF', '#D4ECEE', '#E1DFEB'],
    secondary: {
      dark: '#1C7958',
      standard: '#77AFA2',
    },
  },
  shadow: {
    handle: '0 0 10px #781c7932',
  },
};

export type BifrostTheme = typeof theme;
declare module '@emotion/react' {
  export interface Theme extends BifrostTheme {
    _: any;
  }
}

export default theme;
