/* Autosys Calendar Health Check */

WITH raw_info AS (
    SELECT
        ub_cal_name                   calendar_name,
        ub_cal_day,
        EXTRACT(YEAR FROM ub_cal_day) calendar_year,
        to_char(ub_cal_day, 'MM-DD')  entry_date
    FROM
        ps_ub_ujo_calendar a
)
SELECT
    a.calendar_name,
    a.calendar_year,
    a.entry_date,
    a.ub_cal_day
FROM
    raw_info a
where 1=1
    and a.ub_cal_day not in (
        select add_months(b.ub_cal_day,12) from raw_info b where a.calendar_name = b.calendar_name and b.calendar_year = (a.calendar_year-1)
    )
    and a.ub_cal_day not in (
        select add_months(b.ub_cal_day,12)+1 from raw_info b where a.calendar_name = b.calendar_name and b.calendar_year = (a.calendar_year-1)
    )
    and a.ub_cal_day not in (
        select add_months(b.ub_cal_day,12)-1 from raw_info b where a.calendar_name = b.calendar_name and b.calendar_year = (a.calendar_year-1)
    )
    and (select count(b.UB_CAL_DAY) from raw_info b where a.calendar_name = b.calendar_name and b.calendar_year = (a.calendar_year-1)) > 0