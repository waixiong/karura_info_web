import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';

import { LastBlockSync, LiquidityDataComponent, Length } from './app.component';
import { theme } from './theme';

import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import {
  AppBar, Toolbar, Typography
} from '@material-ui/core';
import { DexStateProvider } from './dex/dex.state';
import React from 'react';

// https://github.com/Uniswap/uniswap-v3-info/blob/188b6e666afd7e7c00d20a8731cd0ea76fccc6c9/src/components/BarChart/alt.tsx
// https://github.com/Uniswap/uniswap-v3-info/blob/188b6e666afd7e7c00d20a8731cd0ea76fccc6c9/src/components/LineChart/alt.tsx

const queryClient = new QueryClient();

const useStyles = makeStyles((theme) => ({
  appBar: {
    flexGrow: 1,
    position: 'fixed',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  topRight: {
    alignContent: "right",
  },
  displayContent: {
    display: 'flex',
    // flexWrap: 'wrap',
    flexDirection: 'column',
    '& > *': {
      margin: theme.spacing(1),
      width: theme.spacing(80),
      height: theme.spacing(32),
    },
  },
  display: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <div className="App-background">
            <DexStateProvider>
              
                <CustomAppBar/>

                <div className="App">
                  {/* <div className={classes.display}> */}
                    <LiquidityDataComponent/>
                    {/* <Length/> */}
                  {/* </div> */}
                </div>
            </DexStateProvider>
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

function CustomAppBar() {
  const classes = useStyles();

  return (
    // <div className={classes.appBar}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Karura Info
          </Typography>
          <Typography variant="h6" className={classes.topRight}>
            <LastBlockSync/>
          </Typography>
        </Toolbar>
      </AppBar>
    // </div>
  );
}