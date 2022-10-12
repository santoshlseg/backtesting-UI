import datetime, scipy
import warnings
from typing import ValuesView
#from numba import jit
import numpy as np
from numpy.lib import math
import pandas as pd
from bisect import bisect_left
import matplotlib.pyplot as plt
'''from vizlab.axis import axis_month, axis_year, axis_decade
from vizlab.plots import pcolormesh
from vizlab.functions import *'''

from axis import *

tercile_colours = ["#D7191C", "#CCCC66", "#2C7BB6", "black"]
quintile_colours = ["#D7191C", "#FDAE61", "#CCCC66", "#ABD9E9", "#2C7BB6", "black"]
decile_colours = ['#9e0142','#d53e4f','#f46d43','#fdae61','#fee08b','#e6f598','#abdda4','#66c2a5','#3288bd','#193296', 'black']

def unique(xs):
    # return list(set(x))  # Would not preserve the order
    seen = set()
    result = []
    for x in xs:
        if not x in seen:
            result.append(x)
            seen.add(x)
    return result


def dbLag(x, lag=1):
    """
    Take an id×date Numpy matrix or Pandas DataFrame and shift it.
    Negative lags allow you to look into the future.
    Returns Pandas or Numpy objects:
                     List -> Pandas (1d)
         Numpy (1d or 2d) -> Numpy
        Pandas (1d or 2d) -> Pandas
    """
    if lag == 0:
        return x
    if type(x) == list:
        x = pd.Series(x)
    assert len(x.shape) in [1, 2]
    y = np.NaN * x
    if len(x.shape) == 2:
        is_pandas = type(x) == pd.core.frame.DataFrame
        nc = x.shape[1]
        if abs(lag) >= nc:
            return y
        if lag > 0:
            if is_pandas:
                y.values[:, lag:nc] = x.values[:, 0 : (nc - lag)]
            else:
                y[:, lag:nc] = x[:, 0 : (nc - lag)]
        else:
            if is_pandas:
                y.values[:, 0 : (nc + lag)] = x.values[:, (-lag):nc]
            else:
                y[:, 0 : (nc + lag)] = x[:, (-lag):nc]
    elif len(x.shape) == 1:
        is_pandas = type(x) == pd.core.series.Series
        nc = x.shape[0]
        if abs(lag) >= nc:
            return y
        if lag > 0:
            if is_pandas:
                y.values[lag:nc] = x.values[0 : (nc - lag)]
            else:
                y[lag:nc] = x[0 : (nc - lag)]
        else:
            if is_pandas:
                y.values[0 : (nc + lag)] = x.values[(-lag):nc]
            else:
                y[0 : (nc + lag)] = x[(-lag):nc]
    return y


#@jit
def dbLag_np(x, k=1):  # Not significantly faster
    m, n = x.shape
    y = np.nan * x
    if k >= 0 and k < n:
        for i in range(m):
            for j in range(n - k):
                y[i, j + k] = x[i, j]
    elif k < 0 and (-k) < n:
        for i in range(m):
            for j in range(n + k):
                y[i, j] = x[i, j - k]
    return y


def dbCoalesce(*arg):
    """
    Replace missing values in the first argument
    by the values in the second (or third, etc.).
    Similar to SQL's COALESCE.
    We do not only replace NaNs, but infinites as well.
    If you want to replace missing values with a constant, you can directly use fillna().
    """
    x = arg[0].copy()
    is_pandas = type(x) in [pd.core.frame.DataFrame, pd.core.series.Series]
    for i in range(1, len(arg)):
        if is_pandas:
            # x = x.where( ~ x.isnull(), arg[i] )
            if "values" in dir(arg[i]):
                a = arg[i].values
            else:
                a = arg[i]
            x.values[:] = np.where(np.isfinite(x.values), x.values, a)
        else:
            x = np.where(np.isfinite(x), x, arg[i])
    return x


#@jit(forceobj=True)
def fractile(x, n=5):
    q = np.nanpercentile(x, np.linspace(0, 100, n + 1), axis=0)
    q[0] = q[0] - 1
    q[n] = q[n] + 1
    return q

#TODO: Write a fractile template decorator
def dbFractiles(x, n=5):
    y = x.copy()
    if type(x) == list or len(x.shape) == 1:
        q = fractile(x, n)
        z = [
            bisect_left(q, u) for u in x
        ]
        if type(y) == pd.core.series.Series:
            y.iloc[:] = z
        else:
            y[:] = z
        if type(x) == list:
            y = [u if u != 0 else np.NaN for u in y]
        else:
            y[y == 0] = np.NaN
        return y
    assert len(x.shape) in [1, 2]
    is_pandas = type(x) == pd.core.frame.DataFrame
    for i in range(x.shape[1]):
        if is_pandas:
            y.iloc[:, i] = dbFractiles(x.iloc[:, i], n)
        else:
            y[:, i] = dbFractiles(x[:, i], n)
    return y

def customRankFractile(x, n, max_=10, min_=1, *args, **kwargs):
    """
    Custom fractiling function. Follows template from dbFractile

    Use in signal_backtest as follows:
    >>> from vizlab.signal_backtest import customRankFractile
    >>> signal_backtest(
            log_returns = log_returns.T,
            signal      = ranks.T,
            fractile_fn = customRankFractile,   # Default
            n           = 5                     # Linear interval between custom rank max and min
        )

    To change max,min parameters:

    >>> def customRankFractile_Max_8_Min_5( max_=8, min_=3, **kwargs ):
            ## Uses x,n input from signal_backtest ##
            return customRankFractile( max_=max_, min_=min_, **kwargs )

    >>> signal_backtest(
            log_returns = log_returns.T,
            signal      = ranks.T,
            fractile_fn = customRankFractile_Max_8_Min_5,
            n           = 5                                 # Linear interval between custom rank max and min
        )

    To insert a custom interval:

    >>> def customRankFractile_1_3_8_10( n=3, interval=[1,3,8,10], **kwargs ):
            \"\"\" Uses x input from signal_backtest, overwrites n=3 \"\"\"
            return customRankFractile( n=n, interval=interval, **kwargs )
    
    Please note that n is replaced in customRankFractile_1_3_8_10\n
    n=5 passed from singal_backtest will not have any effect\n
    IMPORTANT: when using intervals, # of splits must be equal to n\n
    >>> signal_backtest(
            log_returns = log_returns.T,
            signal      = ranks.T,
            fractile_fn = customRankFractile_1_3_8_10,  
            n           = 5                             # overriden to n=3
        )
    """
    y = x.copy()    
    if type(x) == list or len(x.shape) == 1:
        
        ### Fractiling Logic ###
        q    = kwargs.get("interval", False)

        if not q:
            max_ = max_ or kwargs.get("max_", None)
            min_ = min_ or kwargs.get("min_", None)
            max_,min_ = max_ or np.nanmax(y) , min_ or np.nanmin(y)

            q = np.linspace(min_, max_, n+1)
        else:
            q = q.copy()
            q = sorted(q)
            
        assert len(q) == n+1, f"number of intervals provided {q} != {n} + 1"
        
        q[0] = q[0] - 1
        q[n] = q[n] + 1
        
        ranges = zip( q[:-1] , q[1:] )
        z = np.zeros_like(y)
        z[:] = np.nan
        
        for c,(i,j) in enumerate(ranges, 1):
            z[ (i <= y) & (y < j) ] = c
        ### END LOGIC ###
        
        if type(y) == pd.core.series.Series:
            y.iloc[:] = z
        else:
            y[:] = z
        if type(x) == list:
            y = [u if u != 0 else np.NaN for u in y]
        else:
            y[y == 0] = np.NaN
        return y

    assert len(x.shape) in [1, 2]
    is_pandas = type(x) == pd.core.frame.DataFrame
    for i in range(x.shape[1]):
        if is_pandas:
            y.iloc[:, i] = customRankFractile(x.iloc[:, i], n, max_=max_, min_=min_, *args, **kwargs)
        else:
            y[:, i] = customRankFractile(x[:, i], n, max_=max_, min_=min_, *args, **kwargs)
    return y

def dbCreateBaskets(x, n=5, fractile_fn=dbFractiles):
    """
    Given an investment signal as an id×date matrix,
    compute the weights of the quintile portfolios.
    Returns of list of n weight matrices and fractile ranks
    """
    y = fractile_fn(x=x, n=n)
    r = []
    for k in range(1, n + 1):
        w = y == k
        w = np.float64(1) * w  # To avoid problems with divisions by zero...
        w = w / w.sum(axis=0)
        w = w.fillna(0)
        r.append(w)
    return r, y

def rebalance(
        weights,
        freq
    ):
    if freq is None:
        return weights

    assert isinstance(freq, (str, list, pd.tseries.offsets.DateOffset)), f"Frequency is invalid: {freq}"

    dates = pd.to_datetime(weights.columns)
    s = dates[  0 ]
    e = dates[ -1 ]

    is_string = isinstance(freq, (str, pd.tseries.offsets.DateOffset) )
    is_list_of_dates = isinstance(freq, list) and isinstance(freq[0], (str, datetime.date, datetime.datetime, pd.Timestamp))

    if is_string:
        rebalance_dates = pd.date_range(start=s, end=e, freq=freq)
    elif is_list_of_dates:
        rebalance_dates = pd.to_datetime(freq)
        assert all( [ s<=r<=e for r in rebalance_dates ] ), f"Invalid Dates: {np.array(rebalance_dates[[ (s>r) or (r>e) for r in rebalance_dates ]])}"
    
    invalid = np.where( ~np.in1d( rebalance_dates, dates ) )[0]
    if any( np.isfinite(invalid) ):
        nearest = np.array( list( map( lambda x: np.argmin( np.absolute( dates - x ) ), rebalance_dates[invalid] ) ) )
        # LOG(f"\nInvalid Dates: {np.array(rebalance_dates)[[invalid]]}\nFound Available Dates: {np.array( dates )[[nearest]]}")
        rebalance_dates = np.array( rebalance_dates )
        rebalance_dates[[invalid]] = np.array( dates )[[nearest]]

    if dates[0] not in rebalance_dates:
        rebalance_dates = np.insert(rebalance_dates, 0, dates[0], axis=0)
    
    i = np.where( np.in1d( dates, rebalance_dates ) )[0]
    w = np.zeros_like(weights) 
    w[:]= np.nan
    w[:, i] = weights.values[:, i]
    w = pd.DataFrame(w, columns=weights.columns, index=weights.index).fillna(method="ffill", axis=1)

    return w  

def dbComputePortfolioReturns(
    weights,
    trailing_ratio_returns,
    trading_fee=0,
    long_fee=0,
    short_fee=0,
    cash_return=0,):
    """
    Compute the (trailing, ratio) returns of a portfolio.
    The first value of the resulting vector is always NaN,
    because we do not have the weights at time -1.
    In case of a bankruptcy, the ratio returns will be below -1,
    but the subsequent values will be as if there had been no bankruptcy
    (this contrasts with DBaseR::dbComputePortfolioReturns, which returns incorrect values).
    """
    assert long_fee == 0, "Not implemented"
    assert short_fee == 0, "Not implemented"
    assert cash_return == 0, "Not implemented"

    assert (
        weights.shape == trailing_ratio_returns.shape
    )
    # TODO: Allow different frequencies
    trailing_weights = dbLag(weights, 1)
    transaction_costs = trading_fee * np.abs(
        trailing_weights - dbLag(trailing_weights, 1)
    )  # WRONG
    transaction_costs = dbCoalesce(transaction_costs, 0)
    transaction_costs = np.sum(transaction_costs, axis=0)
    r = trailing_weights * trailing_ratio_returns
    r = dbCoalesce(r, 0)
    r = np.sum(r, axis=0)
    r = r - transaction_costs
    r[0] = np.NaN
    return r


def seq_date(start=datetime.date.today(), length=10, by=datetime.timedelta(1)):
    """
    List of dates.
    The increment is in days -- you cannot have months or years.
    TODO: Remove this. There is already pd.date_range, which does much more.
    """
    return [start + i * by for i in range(length)]


def periodicity(dates):
    """
    Estimate the periodicity ("daily", "weekly", "monthly", "annual", etc.)
    of a sorted list of dates.
    """
    assert type(dates) in [list, pd.core.indexes.datetimes.DatetimeIndex]
    for d in dates:
        assert type(d) in [pd.Timestamp, datetime.date]
    p = np.median([ns / 24 / 60 / 60 / 1e9 for ns in np.diff(dates).astype("float")])
    periodicities = {
        "daily": 1,
        "weekly": 7,
        "monthly": 365.25 / 12,
        "quarterly": 365.25 / 4,
        "semiannual": 365.25 / 2,
        "annual": 365.25,
        "2y": 2 * 365.25,
        "3y": 3 * 365.25,
        "5y": 5 * 365.25,
        "10y": 10 * 365.25,
    }
    i = np.argmin([abs(math.log(p) - math.log(v)) for v in periodicities.values()])
    return list(periodicities.keys())[i]
    
    
def dbAnalyzeReturns(ratio_returns, as_df=False):
    """
    Compute some performance metrics from a time series of returns (Pandas Series, indexed by dates).
    The dates are needed to annualize some of those metrics
    and to allow irregularly-spaced time series
    (the R function assumes that the time series is regular).
    Returns:
    - Total Number of Observations
    - Valid Observations
    - Start Date
    - End Date
    - Frequency
    - Cumulative Return
    - CAGR (Compounded Annualized Growth Rate)
    - Annualized Volatility
    - Information Ratio
    - t-stat
    - Skewness                [not annualized]
    - Kurtosis                [not annualized]
    - Hit Ratio: Proportion of periods with positive returns
    - Maximum Drawdown
    - Value-at-Risk 95%       [not annuzlized]
    - Expected Shortfall 95%  [not annualized]
    """
    assert (
        type(ratio_returns) is pd.core.series.Series
    ), "The returns should be a Pandas Series, indexed by dates"
    dates = pd.to_datetime(ratio_returns.index)

    r = ratio_returns.copy()

    result = {}
    result["Total Number of Observations"] = len(r)
    result["Valid Observations"] = np.isfinite(r).sum()

    if np.all(np.isnan(r)):
        return result

    ## Remove missing values at the begining
    i = np.flatnonzero(np.isfinite(r))
    r = r[i[0] :]

    result["Start Date"] = dates[max(i[0] - 1, 1)].to_pydatetime().date()
    result["End Date"] = dates[i[-1]].to_pydatetime().date()

    # Replace missing values by zero (for consistency with R)
    # This is a bad idea: it will lower the apparent volatility
    r[np.isnan(r)] = 0

    result["Frequency"] = periodicity(dates)
    log_return = np.sum(dbCoalesce(np.log1p(r), 0))
    result["Cummulative Return"] = math.expm1(log_return)
    y = (result["End Date"] - result["Start Date"]).days / 365.25
    result["CAGR"] = math.expm1(log_return / y)

    ## The volatility of an irregularly-spaced time series is slightly less straightforward.
    ## The standard deviation of the daily returns is:
    ##   sd( return / math.sqrt( number_of_days_in_each_period )
    ## Then, annualize by multiplying by sqrt(365.25).
    # days = [ np.NaN] +  [ ns / 24 / 3600 / 1e9 for ns in np.diff(dates).tolist() ]
    # x = np.log1p( r ) / np.sqrt( days )
    # x = x[ ~ np.isnan(x) ]
    # result["Annualized Volatility"] = math.sqrt(365.25) * np.std(x)
    ## To be consistent with the R implementation:
    result["Annualized Volatility"] = np.std(r, ddof=1) * math.sqrt(len(r) / y)

    ## Use np.float64 (not np.float) in case the volatility is zero: Python throws an exception...
    result["Information Ratio"] = result["CAGR"] / np.float64(
        result["Annualized Volatility"]
    )

    result["t-stat"] = np.float64(np.mean(r)) / np.std(r, ddof=1) * math.sqrt(len(r))

    ## Not annualized (to be consistent with R)
    result["Skewness"] = scipy.stats.skew(r)
    result["Kurtosis"] = scipy.stats.kurtosis(r)

    ## Use the same formulas as in R
    result["Skewness"] = ((r - r.mean()) ** 3 / np.var(r, ddof=1) ** 1.5).mean()
    result["Kurtosis"] = ((r - r.mean()) ** 4 / np.var(r, ddof=1) ** 2).mean() - 3

    result["Hit Ratio"] = np.sum(r > 0) / len(r)

    result["Maximum Drawdown"] = (
        (1 + r).cumprod() / (1 + r).cumprod().cummax() - 1
    ).min()

    result["Value-at-Risk 95%"] = np.percentile(r, 0.05)
    result["Expected Shortfall 95"] = np.mean(r[r < np.percentile(r, 0.05)])

    if as_df:
        result = pd.DataFrame([result])
        column_order = [
            "Total Number of Observations",
            "Valid Observations",
            "Start Date",
            "End Date",
            "Frequency",
            "Cummulative Return",
            "CAGR",
            "Annualized Volatility",
            "Information Ratio",
            "t-stat",
            "Skewness",
            "Kurtosis",
            "Hit Ratio",
            "Maximum Drawdown",
            "Value-at-Risk 95%",
            "Expected Shortfall 95",
        ]
        column_order = [column for column in column_order if column in result.keys()]
        column_order = unique(column_order + list(result.keys()))
        result = result[column_order]

    return result


def cumsum_na(x):
    """
    Cummulated sum (like np.cumsum) which ignores and preserves
    non-finite values (NaN and infinities).
    """
    mask = ~np.isfinite(x)
    y = x.copy()
    y[mask] = 0
    y = np.cumsum(y)
    y[mask] = np.NaN
    return y


def replace_first_NaN_with_1(x):
    assert len(x.shape) == 1
    was_pandas = isinstance(x, pd.Series)
    y = x.copy()
    if was_pandas:
        x = x.values
    i = np.nonzero(dbLag(np.isfinite(x), -1))[0][0]
    if not np.isfinite(x[i]):
        if was_pandas:
            y.iloc[i] = 1
        else:
            y[i] = 1
    return y

def signal_backtest(
    signal,
    log_returns,
    trading_fee=0,
    date=None,
    n=5,
    fractile_fn=dbFractiles,
    rebalancing_freq=None,
    benchmark=None
):
    """
    Backtest an investment signal.
    Inputs
      signal:      Pandas DataFrame, with one row per stock and one column per date
      log_returns: Pandas DataFrame, with one row per stock and one column per date
                   The inputs should have the same size.
      trading_fee: Passed to dbComputePortfolioReturns (currently buggy)
      date:        End of the in-sample period, for the performance computations (in-sample: <= date; out-of-sample: > date)
      n:           Fractiles
      fractile_fn: Passed to dbCreateBaskets to generate portfolios using a fractile function
    Outputs
      weights:     List of Pandas id×date DataFrames with the weights of the quintile portfolios
                   (0=bottom, 1, 2, 3, 4=top) and the long-short one
      ranks:       Pandas idxdate DataFrame with ranks given to each stock
                   based on the fractile function
      log-returns: Pandas DataFrame with the portfolio returns,
                   one row per portfolio and one column per date
      ratio-returns: Idem with the ratio returns
      prices:        Idem with the portfolio wealths (starting at 1)
      performance:   Pandas DataFrame with the performance metrics (columns) of each portfolio (rows)
      in-sample:     In-sample performance
      out-of-sample: Out-of-sample performance
    """
    dates = pd.to_datetime(signal.columns)

    # If log returns contain NaN, project it onto signals
    # signal[np.isnan(log_returns)] = np.nan

    ws, ranks = dbCreateBaskets(signal, n=n, fractile_fn=fractile_fn)
    ws.append(ws[-1] - ws[0])
    ws = [ rebalance( w, rebalancing_freq ) for w in ws]

    turnover = [
        np.abs((w.iloc[:, 1:].values - w.iloc[:, :-1].values)).sum(axis=0) for w in ws
    ]
    turnover = np.array(turnover)
    turnover = pd.DataFrame(turnover, columns=signal.columns[1:])

    # Simple Returns: https://investmentcache.com/magic-of-log-returns-concept-part-1/
    # https://www.portfolioprobe.com/2010/10/04/a-tale-of-two-returns/
    #  simple returns aggregate across assets
    #  log returns aggregate across time

    trailing_ratio_returns = np.expm1(log_returns)
    rs = [
        dbComputePortfolioReturns(w, trailing_ratio_returns, trading_fee=trading_fee)
        for w in ws
    ]
    rs = [np.log1p(r) for r in rs]
    ps = [np.exp(cumsum_na(r)) for r in rs]
    ps = [replace_first_NaN_with_1(p) for p in ps]
    perf = [dbAnalyzeReturns(r, as_df=True) for r in rs]
    ids = [str(i + 1) for i in range(n)] + ["LS"]
    ids = pd.DataFrame({"portfolio": ids})
    perf = pd.concat(perf).reset_index(drop=True)
    perf = perf.join(pd.DataFrame(turnover.median(axis=1), columns=["Turnover"]))
    perf = ids.join(perf)

    result = {
        "dates": dates,
        "weights": {**{f"Q{i+1}": ws[i] for i in range(len(ws) - 1)}, **{"LS": ws[-1]}},
        "ranks": ranks.astype(int, errors="ignore"),
        "benchmark": benchmark,
        "log_returns": pd.DataFrame(rs).round(6),
        "ratio_returns": np.expm1(pd.DataFrame(rs)).round(6),
        "prices": pd.DataFrame(ps).round(6),
        "performance": perf,
        "turnover": turnover.round(6),
        "date": date,
    }

    if date is not None:
        in_sample_dates = np.less_equal(turnover.columns, date)
        out_of_sample_dates = np.greater(turnover.columns, date)
        perf_in = [dbAnalyzeReturns(r[signal.columns <= date], as_df=True) for r in rs]
        perf_out = [dbAnalyzeReturns(r[signal.columns > date], as_df=True) for r in rs]
        perf_in = pd.concat(perf_in).reset_index(drop=True)
        perf_out = pd.concat(perf_out).reset_index(drop=True)
        perf_in = perf_in.join(
            pd.DataFrame(
                turnover.iloc[:, in_sample_dates].median(axis=1), columns=["Turnover"]
            )
        )
        perf_out = perf_out.join(
            pd.DataFrame(
                turnover.iloc[:, out_of_sample_dates].median(axis=1),
                columns=["Turnover"],
            )
        )
        perf_in = ids.join(perf_in)
        perf_out = ids.join(perf_out)
        result["in-sample"] = perf_in
        result["out-of-sample"] = perf_out

    return result


def select_cmap(n):
    return {
        3:tercile_colours,
        5:quintile_colours,
        10:decile_colours
    }[n]
    
def plot_signal_backtest(
    r,
    title="",
    filename=None,
    ax=None,
    log_scale=False,
    y_label="Wealth",
    performance=True,
    colours=quintile_colours,
    date_axis=axis_year,
    **kwargs,
):
    """
    TODO: Add a date axis
    TODO: Add a legend?
    """
    ax_was_None = False

    if ax is None:
        ax_was_None = True
        figsize = kwargs.get( "figsize", (8,4) )
        fig, ax = plt.subplots( figsize=figsize )

    colours = select_cmap(len(r["performance"]) - 1)

    for i in range(r["prices"].shape[0]):
        ax.plot(r["dates"], r["prices"].iloc[i, :], color=colours[i], linewidth=3)
    if r["benchmark"] is not None:
        ax.plot(r["dates"], r['benchmark'].reindex(r['dates'], axis=1).iloc[0, :], color="grey", linestyle="--", linewidth=2.5)
    xmin = r["prices"].columns[0]
    xmax = r["prices"].columns[-1]
    ymin = r["prices"].min().min()
    ymax = r["prices"].max().max()
    # plt.yscale('log')
    # plt.ylim( ymin, ymax )
    # plt.ylabel('Wealth')
    # plt.title(title)
    if r["date"] is not None:
        date = r["date"]
        if type(date) == str:
            date = datetime.datetime.strptime(date, "%Y-%m-%d").date()

        else:
            date = pd.to_datetime(date).date()
        ax.axvline(date, color="black", linewidth=1)
    if r["date"] is not None:
        message = r["out-of-sample"]
    else:
        message = r["performance"]
    message = f"""IR={message["Information Ratio"].iloc[-1]:.2f}\nμ={100*message["CAGR"].iloc[-1]:.1f}%\nσ={100*message["Annualized Volatility"].iloc[-1]:.1f}%"""
    if performance:
        ax.text(
            0.02,
            0.98,
            message,
            horizontalalignment="left",
            verticalalignment="top",
            transform=ax.transAxes,
        )
    if log_scale:
        ax.set_yscale("log")
    if y_label:
        ax.set_ylabel(y_label)

    ax.set_xlim(xmin, xmax)
    ax.set_title(title)
    date_axis(ax)
    if filename is None and ax_was_None:
        plt.show()
    if filename is not None:
        plt.savefig(filename)


def plot_signal_ranks(
    r,
    title="",
    filename=None,
    ax=None,
    colours=quintile_colours,
    x_axis=axis_year,
    **kwargs,
):
    from vizlab import objectview
    kwargs = objectview(**{ **{ "use_weights" : True, "return_ranks" : False, "top": None}, **kwargs })

    if kwargs.use_weights:
        r = r.copy()
        r['weights'] = list( r['weights'].values() )
        w  = np.zeros( r['weights'][0].shape )
        ys = np.array( r['weights'][0].index )
        xs = r['weights'][0].columns
        for i, ws in enumerate( r['weights'][:-1] , 1 ):
            w[ ws != 0.0 ] = i
        w[ w == 0.0 ] = np.nan
        # LOG(w)
    else:
        w = r["ranks"].values
        xs = r["ranks"].columns
        ys = r["ranks"].index
        # LOG(w)
    
    sort_idx = None

    temp = pd.DataFrame(w).T.ewm(span=30).mean()
    sort_idx = temp.iloc[-2].argsort()
    if kwargs.top is not None:
        sort_idx = np.hstack(
            [
                sort_idx[:kwargs.top], 
                sort_idx[-kwargs.top:]
            ]
        )

    ax_was_None = False
    if ax is None:
        ax_was_None = True
        fig, ax = plt.subplots(figsize=(20, int(0.20 * len(sort_idx))))

    # plt.yscale('log')
    # plt.ylim( ymin, ymax )
    # plt.ylabel('Wealth')
    # plt.title(title)

    cmap = make_cmap(colours[:-1])
    cmap.set_bad(color="white")
    pcolormesh(xs, ys[sort_idx].tolist(), w[sort_idx, :], cmap=cmap, ax=ax)

    ax.set_title(title)

    x_axis(ax)

    if filename is None and ax_was_None:
        plt.show()

    if filename is not None:
        plt.savefig(filename)
        
    if kwargs.return_ranks:
        return pd.DataFrame( w.T , xs, ys )


def plot_backtest_performance():
    raise NotImplementedError()

    def f(cmap="Blues"):
        a = plt.get_cmap(cmap)
        dir(a)
        ts = [u[0] for u in a._segmentdata["red"]]
        return [a(t) for t in ts]

    all_colours = {
        "colours": colours,
        "tercile_colours": tercile_colours,
        "quintile_colours": quintile_colours,
        "Pastel1": plt.get_cmap("Pastel1").colors,
        "Pastel2": plt.get_cmap("Pastel2").colors,
        "Paired": plt.get_cmap("Paired").colors,
        "Accent": plt.get_cmap("Accent").colors,
        "Dark2": plt.get_cmap("Dark2").colors,
        "Set1": plt.get_cmap("Set1").colors,
        "Set2": plt.get_cmap("Set2").colors,
        "Set3": plt.get_cmap("Set3").colors,
        "tab10": plt.get_cmap("tab10").colors,
        "tab20": plt.get_cmap("tab20").colors,
        "tab20b": plt.get_cmap("tab20b").colors,
        "tab20c": plt.get_cmap("tab20c").colors,
        "colours_kelly": colours_kelly,
        "colours_glasbey": colours_glasbey,
        "colors_green_armytage": colors_green_armytage,
        "colours_polychrome_36": colours_polychrome_36,
        "colours_alphabet": colours_alphabet,
        "colours_dark24": colours_dark24,
        "colours_light24": colours_light24,
        "colours_sky": colours_sky,
    }
    fig, ax = plt.subplots(figsize=(20, len(all_colours) / 2))
    n = len(all_colours)
    for i, label in enumerate(all_colours.keys()):
        col = all_colours[label]
        ax.scatter([i for i in range(len(col))], [n - i for u in col], color=col)
        for j in range(len(col)):
            ax.add_patch(
                plt.Rectangle((j - 0.4, n - i - 0.4), 0.8, 0.8, fill=True, color=col[j])
            )
            ax.text(j, n - i, j, color="white", va="center", ha="center", weight="bold")
        ax.text(-0.5, n - i, label, ha="right")
    ax.axis("off")
    fig.tight_layout()
    plt.show()

def make_cmap( ramp_colors, show=False ):
    from colour import Color
    from matplotlib.colors import LinearSegmentedColormap

    color_ramp = LinearSegmentedColormap.from_list( 'my_list', [ Color( c1 ).rgb for c1 in ramp_colors ], N=256)
    if show:
        plt.figure( figsize = (15,3))
        plt.imshow( [list(np.arange(0, len( ramp_colors ) , 0.1)) ] , interpolation='nearest', origin='lower', cmap= color_ramp )
        plt.xticks([])
        plt.yticks([])
    return color_ramp