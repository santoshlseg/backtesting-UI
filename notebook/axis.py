import matplotlib, re

def axis_month(ax, format = "%b"):
    ax.xaxis.set_major_locator(matplotlib.dates.MonthLocator())
    ax.xaxis.set_minor_locator(matplotlib.dates.MonthLocator(bymonthday=15))
    ax.xaxis.set_major_formatter(matplotlib.ticker.NullFormatter())
    if type(format) == str:
        ax.xaxis.set_minor_formatter(matplotlib.dates.DateFormatter(format))
    else:
        ax.xaxis.set_minor_formatter(format)
    for tick in ax.xaxis.get_minor_ticks():
        tick.tick1line.set_markersize(0)
        tick.tick2line.set_markersize(0)
        tick.label1.set_horizontalalignment('center')
    ticks = ax.xaxis.get_major_ticks()
    xlocs = ax.get_xticks()
    for pos, tick in zip(xlocs, ticks):
        date = matplotlib.dates.num2date(pos)
        if date.month == 1:
            tick.tick1line.set_markersize(15)
        
def axis_year(ax, format="%Y"):
    ax.xaxis.set_major_locator(matplotlib.dates.YearLocator())
    ax.xaxis.set_minor_locator(matplotlib.dates.YearLocator(month=7, day=1))
    ax.xaxis.set_major_formatter(matplotlib.ticker.NullFormatter())
    ax.xaxis.set_minor_formatter(matplotlib.dates.DateFormatter(format))
    for tick in ax.xaxis.get_minor_ticks():
        tick.tick1line.set_markersize(0)
        tick.tick2line.set_markersize(0)
        tick.label1.set_horizontalalignment('center')
    ticks = ax.xaxis.get_major_ticks()
    xlocs = ax.get_xticks()
    for pos, tick in zip(xlocs, ticks):
        date = matplotlib.dates.num2date(pos)
        if date.year % 10 == 0:
            tick.tick1line.set_markersize(15)                
    
def axis_decade(ax):
    ax.xaxis.set_major_locator(matplotlib.dates.YearLocator(10))
    ax.xaxis.set_minor_locator(matplotlib.dates.YearLocator(5,month=7, day=1))
    ax.xaxis.set_major_formatter(matplotlib.ticker.NullFormatter())
    
    def f(u): 
        date = matplotlib.dates.num2date(u)
        if date.year % 10 == 5:
            s = date.strftime("%Y")
            s = re.sub( "5$", "0s", s )
            return s
        else:
            return ''
    ax.xaxis.set_minor_formatter( lambda u,v: f(u) )
        
    for tick in ax.xaxis.get_minor_ticks():
        tick.tick1line.set_markersize(0)
        tick.tick2line.set_markersize(0)
        tick.label1.set_horizontalalignment('center')
