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
calendar_name, calendar_year, count(*)
FROM
    raw_info a
where 1=1
group by calendar_name, calendar_year
order by calendar_name, calendar_year