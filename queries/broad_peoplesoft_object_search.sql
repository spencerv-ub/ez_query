SELECT
menu.menuname MENU_NAME,
component.pnlgrpname COMPONENT_NAME,
page.PNLNAME PAGE_NAME, 
record.RECNAME RECORD_NAME, 
field.FIELDNAME FIELD_NAME,
page.LBLTEXT FIELD_LABEL
FROM 
PSDBFIELD field
left join PSRECFIELD record on record.fieldname = field.fieldname
left join PSPNLFIELD page on page.recname = record.recname AND page.fieldname = field.fieldname
left join PSPNLGROUP component on page.pnlname = component.pnlname
left join PSMENUITEM menu on menu.itemname = component.pnlgrpname
where 1=1
AND (
    (field.fieldname like '%' || :search_term || '%')
    OR (record.recname like '%' || :search_term || '%')
    OR (page.pnlname like '%' || :search_term || '%')
    OR (component.pnlgrpname like '%' || :search_term || '%')
    OR (menu.menuname like '%' || :search_term || '%')
)