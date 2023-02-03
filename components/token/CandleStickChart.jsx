import {
    Button,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useMediaQuery,
    useTheme,
  } from '@mui/material';
  import Link from '@components/MuiNextLink';
  import { createChart, CrosshairMode } from 'lightweight-charts';
  import theme from '@styles/theme';
  import { useState } from 'react';
  import { useEffect, useRef } from 'react';
  import axios from 'axios';
  
  const stepUnitMapper = {
    '1h': {
      stepSize: 1,
      stepUnit: 'h',
      inSeconds: 3600,
    },
    '4h': {
      stepSize: 4,
      stepUnit: 'h',
      inSeconds: 14400,
    },
    '1d': {
      stepSize: 1,
      stepUnit: 'd',
      inSeconds: 86400,
    },
    '1w': {
      stepSize: 1,
      stepUnit: 'w',
      inSeconds: 604800,
    },
    '1m': {
      stepSize: 1,
      stepUnit: 'm',
    },
  };
  
  const pairBaseCurrencyMapper = {
    ergopad_sigusd: ' SigUSD',
    ergopad_erg: ' Erg',
  };
  
  const initHistoryData = [
      {
        time: new Date(0).toISOString(),
        open: 1,
        high: 1,
        low: 1,
        close: 1,
        volume: 1,
      },
      {
        time: new Date(Date.now()).toISOString(),
        open: 1,
        high: 1,
        low: 1,
        close: 1,
        volume: 1,
      },
    ];
  
  const CandleStickChart = () => {
    const mtheme = useTheme();
    const matches = useMediaQuery(mtheme.breakpoints.up('md'));
    const [rawData, setRawData] = useState(initHistoryData);
    const [stepUnit, setStepUnit] = useState('1h');
    const [pair, setPair] = useState('ergopad_erg');

    const chartContainerRef = useRef();

    const candleData = rawData.map((dataPoint) => {
        return {
          time: new Date(dataPoint.time).valueOf()/1000,
          open: dataPoint.open,
          high: dataPoint.high,
          low: dataPoint.low,
          close: dataPoint.close,
        };
      });
  
    const volumeData = rawData.map((dataPoint) => {
        var color = theme.palette.primary.main
        if (dataPoint.open > dataPoint.close) color = theme.palette.secondary.main
        return {
        time: new Date(dataPoint.time).valueOf()/1000,
        value: dataPoint.volume,
        color: color
        };
    });

    useEffect(() => {
        chartContainerRef.current.replaceChildren();
        const Chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: {
            backgroundColor: theme.palette.background.default,
            textColor: theme.palette.text.primary,
            },
            grid: {
            vertLines: {
                color: 'rgba(197, 203, 206, 0.5)',
            },
            horzLines: {
                color: 'rgba(197, 203, 206, 0.5)',
            },
            },
            crosshair: {
            mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)',
            },
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
                timeVisible: true
            },
        });
        
        const candleSeries = Chart.addCandlestickSeries({
            upColor: theme.palette.primary.main,
            downColor: theme.palette.secondary.main,
            borderDownColor: theme.palette.secondary.main,
            borderUpColor: theme.palette.primary.main,
            wickDownColor: theme.palette.secondary.main,
            wickUpColor: theme.palette.primary.main,
            priceFormat: { type: 'price', precision: 6, minMove: 0.000001 },
        });
    
        const volumeSeries = Chart.addHistogramSeries({
            color: theme.palette.secondary.main,
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });
        candleSeries.setData(candleData);
        volumeSeries.setData(volumeData);

        Chart.timeScale().fitContent();
    }, [rawData])
  
    useEffect(() => {
      const getData = async () => {
        try {
          const res = await axios.get(
            `${process.env.API_URL}/asset/ohlcv/erg/ergopad/${stepUnitMapper[stepUnit].stepSize}/${stepUnitMapper[stepUnit].stepUnit}/${new Date(Date.now()-(400000*stepUnitMapper[stepUnit].inSeconds)).toISOString().slice(0, 10)}/${new Date(Date.now()+86400000).toISOString().slice(0, 10)}?offset=0&limit=500`
          );
          setRawData(res.data);        
        } catch (e) {
          console.log(e);
        }
      };
  
      getData();
    }, [stepUnit, pair]);

    const lastPrice = rawData.length
      ? Math.round(rawData[rawData.length-1].close * 10000) / 10000
      : 1;
  
    const handleStepChange = (e, newAlignment) => {
      if (newAlignment !== null) {
        setStepUnit(newAlignment);
      }
    };
  
    const handlePairChange = (e, newAlignment) => {
      if (newAlignment !== null) {
        setPair(newAlignment);
      }
    };
  
    return (
      <>
        <Typography variant="h4">
          1 ErgoPad = {lastPrice}
          {pairBaseCurrencyMapper[pair]}
        </Typography>
        <Grid>
          <Grid container>
            <Grid item md={6} xs={12}>
              <ToggleButtonGroup
                color="info"
                value={pair}
                exclusive
                onChange={handlePairChange}
                sx={{ mb: 2, mt: 0 }}
                size="small"
              >
                <ToggleButton value="ergopad_sigusd">SigUSD</ToggleButton>
                <ToggleButton value="ergopad_erg">Erg</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
              sx={{
                display: 'flex',
                justifyContent: matches ? 'flex-end' : 'flex-start',
              }}
            >
              <ToggleButtonGroup
                color="info"
                value={stepUnit}
                exclusive
                onChange={handleStepChange}
                sx={{ mb: 2, mt: 0 }}
                size="small"
              >
                <ToggleButton value="1h">1 hour</ToggleButton>
                <ToggleButton value="4h">4 hours</ToggleButton>
                <ToggleButton value="1d">1 day</ToggleButton>
                <ToggleButton value="1w">1 week</ToggleButton>
                {/* <ToggleButton value="1m">1 month</ToggleButton> */}
              </ToggleButtonGroup>
            </Grid>
          </Grid>
          <div ref={chartContainerRef} />
          <Grid sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              underline="none"
              href={'https://app.spectrum.fi/ergo/swap'}
              aria-label="ergodex"
              title="Trade"
              rel="noreferrer"
              target="_blank"
              sx={{ mb: 1, mx: 3 }}
            >
              <Button
                variant="contained"
                sx={{
                  color: '#fff',
                  fontSize: '1rem',
                  py: '0.6rem',
                  px: '1.6rem',
                  textTransform: 'none',
                  backgroundColor: theme.palette.tertiary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.tertiary.hover,
                    boxShadow: 'none',
                  },
                  '&:active': {
                    backgroundColor: theme.palette.tertiary.active,
                  },
                }}
              >
                Trade
              </Button>
            </Link>
          </Grid>
        </Grid>
      </>
    );
  };
  
  export default CandleStickChart;
  