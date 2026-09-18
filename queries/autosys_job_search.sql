with autosys_job_info as (
select
  a.UB_JOID
, a.UB_JOB_VER
, a.UB_OVER_NUM
, a.ub_job_name
, a.ub_job_type
, b.UB_PROCESS_NAME PROCESS_NAME
, b.UB_UJO_PROCESS_TYP PROCESS_TYPE
, b.UB_RUN_CNTRL_ID
, REGEXP_REPLACE(a.UB_MACH_NAME,'.+?PS','') DATABASE
from PS_UB_UJO_JOB a
join PS_UB_UJO_PSFT_JOB b on 1=1
and a.UB_JOB_VER = b.UB_JOB_VER
and a.UB_OVER_NUM = b.UB_OVER_NUM
and a.UB_JOID = b.UB_JOID
), run_control_finder as (
select
  a.PRCSNAME PROCESS_NAME
, a.PRCSTYPE PROCESS_TYPE
, a.PNLGRPNAME COMPONENT
, b.ADDSRCHRECNAME RUN_CNTRL_REC
from PS_PRCSDEFNPNL a
join pspnlgrpdefn b on 1=1
and a.pnlgrpname = b.pnlgrpname
), DATA_BRIDGE as (
select
  a.UB_JOID JOB_ID
, a.UB_JOB_VER JOB_VERSION
, a.UB_OVER_NUM OVERRIDE_NUMBER
, a.UB_JOB_NAME JOB_NAME
, a.PROCESS_NAME
, a.PROCESS_TYPE
, a.DATABASE
, b.COMPONENT
, b.RUN_CNTRL_REC RUN_CONTROL_RECORD
, a.UB_RUN_CNTRL_ID RUN_CONTROL_ID
from autosys_job_info a
left join run_control_finder b on 1=1
and a.PROCESS_NAME = b.PROCESS_NAME
and a.PROCESS_TYPE = b.PROCESS_TYPE
)
select
a.* 
from
DATA_BRIDGE a where 1=1
and a.process_name like '%'||:process_name||'%'