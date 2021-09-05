import React, { useState, useEffect } from 'react';
import { LastBlockNumberQuery, LastBlockQuery } from './block';
import { 
  querySwapData, 
  querySwapUpdate 
} from './dex/dex.query';
import { makeStyles } from '@material-ui/core/styles';
import dayjs from 'dayjs'
import {
  Paper, List, Box, Grid
} from '@material-ui/core';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { theme } from './theme';
import { useDexState } from './dex/dex.state';

const useStyles = makeStyles((theme) => ({
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
  paperCard: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  syncTitle: {
    '& > *': {
      margin: theme.spacing(0),
    },
  },
  smallTitle: {
    fontSize: 12,
  },
  smallValue: {
    fontSize: 20,
  },
}));

export function LastBlockSync() {
  const classes = useStyles();

  const { isLoading, error, data } = LastBlockQuery();
  const { state, dispatch } = useDexState();

  if (!isLoading && error === null) {
    if (state.lastBlock === undefined) {
      querySwapData(data.number, dispatch);
    } else if (state.lastBlock !== data.number) {
      querySwapUpdate(data.number, state, dispatch);
    }
  }

  // if (state.swap !== undefined) {
  //   console.log(`LastBlockSync swap: ${state.swap.length}`);
  // }

  if (isLoading) return 'Loading...'

  if (error) return 'An error has occurred: ' + error.message
  
  return (
    <div className={classes.syncTitle}>
      <p>Sync At Block <strong>{data.number}</strong></p>
      <p className={classes.smallTitle}>{new Date(data.timestamp).toUTCString()}</p>
    </div>
  )
}

export function LiquidityDataComponent() {
  const classes = useStyles();

  const { state } = useDexState();

  if (state.swap === undefined) return 'Loading...';
  // console.log(`LiquidityDataComponent: ${(state.swap?? []).length}`);

  if (state.swap.length <= 0) return 'No Data';

  return (
    <div>
      { (!state.loaded7d)? (<div>Loading 7 days data...</div>) : (<div/>)}
      <List className={classes.displayContent}>
        {state.data.map((pool,index)=>{
          console.log(`\tPool: ${pool.pair}`);
          // return (`${pool.pair}`);
          return <LiquidityPoolDataCard pool={pool} key={pool.pair}/>
        })}
      </List>
    </div>
  );
}

function LiquidityPoolDataCard(props) {
  const pool = props.pool
  const classes = useStyles();

  const [value, setValue] = useState(undefined);
  const [date, setDate] = useState(undefined);

  return (
    <Paper elevation={0}>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Box p={1} pt={1}>
              {pool.pair}
          </Box>

          <Box pl={1} pt={1} className={classes.smallTitle}>
            TVL
          </Box>
          <Box pl={1} pb={1} className={classes.smallValue}>
            not ready
          </Box>
          
          <Box pl={1} pt={1} className={classes.smallTitle}>
            24h Volume
          </Box>
          <Box pl={1} pb={1} className={classes.smallValue}>
              {pool.data24h.volumeNative.toFixed(3)} KSM
          </Box>

          <Box pl={1} pt={1} className={classes.smallTitle}>
            24h Fees
          </Box>
          <Box pl={1} pb={1} className={classes.smallValue}>
            {(pool.data24h.volumeNative*0.003).toFixed(3)} KSM
          </Box>

          <Box pl={1} pt={1} className={classes.smallTitle}>
            {date}
          </Box>
          <Box pl={1} pb={1} className={classes.smallValue}>
            {value}
          </Box>
        </Grid>
        <Grid item xs={8}>
          <BarChart
            width={444}
            height={256}
            data={pool.dataByDays}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
            onMouseLeave={() => {
              setValue(undefined);
              setDate(undefined);
            }}
            >
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            {/* <XAxis dataKey="date" /> */}
            {/* <YAxis /> */}
            <Tooltip 
              cursor={{ fill: theme.palette.secondary.dark }}
              contentStyle={{ display: 'none' }}
              formatter={(value, name, props) => {
                setValue(props.payload.volumeNative.toFixed(3) + ' KSM');
                setDate(dayjs(props.payload.date).format('MMM D, YYYY'));
              }}
            />
            {/* <Legend /> */}
            <Bar dataKey="volumeNative" fill={theme.palette.primary.main} />
          </BarChart>
        </Grid>
      </Grid>
    </Paper>
  );
}