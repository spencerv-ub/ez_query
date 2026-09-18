/* Forecast Query WIP */
with tomorrow as (
select
  sysdate+1 t_date
, SUBSTR(LOWER(TO_CHAR(sysdate+1, 'DY')), 1, 2) t_day
from
dual
), calendar_info as (
select
UB_CAL_NAME
from
ps_UB_UJO_CALENDAR a
, tomorrow
where 1=1
and ub_cal_day = tomorrow.t_date
), raw_info as (
select
  a.UB_JOB_NAME
, REGEXP_REPLACE(a.UB_MACH_NAME,'.+?PS','') DATABASE
, b.*
from PS_UB_UJO_JOB a
join PS_UB_UJO_SCHD_INF b on 1=1
and a.UB_JOB_VER = b.UB_JOB_VER
and a.UB_JOID = b.UB_JOID
and a.UB_OVER_NUM = b.UB_OVER_NUM
) 
select a.* from raw_info a, tomorrow where 1=1
and DATABASE = 'PRD'
and (
  (UB_DAYS_OF_WEEK like '%'||tomorrow.t_day||'%')
  or
  /* Start times and run calendars are reversed right now, swap them when this is fixed */
  (UB_RUN_CALENDAR in (select UB_CAL_NAME from calendar_info))
)
and UB_EXCLUD_CALENDAR not in (select UB_CAL_NAME from calendar_info)