!macro customInstall
  ; Keep user-managed runtime config between upgrades.
  IfFileExists "$INSTDIR\.config" configExists configCreate

configCreate:
  IfFileExists "$INSTDIR\.config.default" 0 configDone
  CopyFiles /SILENT "$INSTDIR\.config.default" "$INSTDIR\.config"
  Delete "$INSTDIR\.config.default"
  Goto configDone

configExists:
  Delete "$INSTDIR\.config.default"

configDone:
  ; Keep runtime database folder between upgrades.
  IfFileExists "$INSTDIR\database" dbExists dbCreate

dbCreate:
  IfFileExists "$INSTDIR\database.default" 0 dbEnsure
  Rename "$INSTDIR\database.default" "$INSTDIR\database"
  Goto dbEnsure

dbExists:
  RMDir /r "$INSTDIR\database.default"

dbEnsure:
  CreateDirectory "$INSTDIR\database"
!macroend
