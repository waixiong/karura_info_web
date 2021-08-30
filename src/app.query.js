import { useState } from 'react';
import { useQuery } from 'react-query';
import { LastBlockNumberQuery } from './block';
import { Volume7DayQuery, Volume24HQuery, LiquidityDataQuery } from './dex/dex.query';
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
import { LiquidityPoolData } from './dex';

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
    smallTitle: {
        fontSize: 12,
    },
    smallValue: {
        fontSize: 20,
    },
  }));

export function Example() {
    const { isLoading, error, data } = useQuery('repoData', () =>
        fetch('https://api.github.com/repos/tannerlinsley/react-query').then(res => {
            var result = res.json();
            console.log(result);
            return result;
        })
    )

    if (isLoading) return 'Loading...'

    if (error) return 'An error has occurred: ' + error.message

    return (
        <div>
            <h1>{data.name}</h1>
            <p>{data.description}</p>
            <strong>👀 {data.subscribers_count}</strong>{' '}
            <strong>✨ {data.stargazers_count}</strong>{' '}
            <strong>🍴 {data.forks_count}</strong>
        </div>
    )
}

export function LastBlockSync() {
    const { isLoading, error, data } = LastBlockNumberQuery();

    if (isLoading) return 'Loading...'

    if (error) return 'An error has occurred: ' + error.message

    return (
        <div>
            <p>Sync At Block <strong>{data}</strong></p>
        </div>
    )
}

export function Volume7DComponent() {
    const { isLoading, error, data } = Volume7DayQuery();

    if (isLoading) return 'Loading...'

    if (error) return 'An error has occurred: ' + error.message

    return (
        <div>
            <p>Sync At Block <strong>{data}</strong></p>
        </div>
    )
}

export function Volume24HComponent() {
    const { isLoading, error, data } = Volume24HQuery();

    if (isLoading) return 'Loading...'

    if (error) return 'An error has occurred: ' + error.message

    return (
        <div>
            <p>Sync At Block <strong>{data}</strong></p>
        </div>
    )
}

export function LiquidityDataComponent() {
    const classes = useStyles();

    const { isLoading, error, data } = LiquidityDataQuery();

    if (isLoading) return 'Loading...';

    if (error) return 'An error has occurred: ' + error.message;

    return (
        <List className={classes.displayContent}>
            {data.map((pool,index)=>{
                return <LiquidityPoolDataCard pool={pool} key={pool.pair}/>
            })}
        </List>
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
                            cursor={{ fill: theme.bg2 }}
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