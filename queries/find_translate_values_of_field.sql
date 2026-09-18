select fieldvalue translate_value,
       xlatshortname short_name,
       xlatlongname "long_name/description"
  from psxlatitem a
 where effdt = (
      select max(effdt)
        from psxlatitem aa
       where 1 = 1
         and fieldname = :field_name
         and aa.fieldname = a.fieldname
         and aa.fieldvalue = a.fieldvalue
         and a.eff_status = 'A'
   )
   and a.eff_status = 'A'
 order by a.fieldvalue asc