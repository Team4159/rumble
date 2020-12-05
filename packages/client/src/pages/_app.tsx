import { ChakraProvider, extendTheme } from '@chakra-ui/react';

import '@/styles/global.css';

const customTheme = extendTheme({
  fonts: {
    heading: "'Open Sans', sans-serif",
    body: "'Open Sans', sans-serif",
  },
});

const App = ({ Component, pageProps }) => (
  <ChakraProvider theme={customTheme}>
    <Component {...pageProps} />
  </ChakraProvider>
);

export default App;
