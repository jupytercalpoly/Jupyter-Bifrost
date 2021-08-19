const theme = {
  color: {
    text: ['#000'],
    background: ['#fff', '#F6F6F6'],
    primary: {
      dark: '#771C79',
      standard: '#AD77AF',
      light: '#E4D2E4',
    },
    pill: [
      { standard: '#F3E5DA', active: '#A84822', dark: '#A84822' },
      { standard: '#E0EEF3', active: '#1A5B71', dark: '#1A5B71' },
      { standard: '#E7EFE3', active: '#517242', dark: '#517242' },
      { standard: '#E5E4F0', active: '#4B3E98', dark: '#4B3E98' },
      { standard: '#F4E6E7', active: '#9E1C3C', dark: '#9E1C3C' },
    ],
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
