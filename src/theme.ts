const theme = {
  color: {
    text: ['#000'],
    background: ['#fff', '#F6F6F6'],
    primary: ['#771C79', '#AD77AF', '#E4D2E4'],
    onSelected: '#E4D2E4',
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
