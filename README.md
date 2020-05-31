How to run: 

1. Install Nodejs.
2. In src\Caissa.ExcelAddin\CustomFunctions, Run "NPM install"
3. In src\Caissa.ExcelAddin\clientApp, run "npm install"
3. In src\Caissa.ExcelAddin\CustomFunctions, Run "npm run-script build"
4. In src\Caissa.ExcelAddin, Run "Dotnet Run Watch". This should start application with port 44360
    - or Start the application inside VS.
5. Open Excel, in Trust Center/Trusted Add-In Catalog, add manifest file in Trusted Catalog Table.
     You can find Trust Center/Trusted Add-In Catalog in Excel option. 
6. Add Add-In
    - Select "Insert", then "My Add-In". 
    - In Shared Folder, add "CAISSA Data and Report Tool"
    - Click on the add-in "CAISSA Data and Report Tool" Add-In" to activate it.
7. In any cell of excel worksheet, run custom function: =CAISSA.FUND.MARKETVALUE.FAIL(). 
   This makes a web request that takes 70 seconds. The call returns Network Request Failed error.
8. In any cell of excel worksheet, run custom function: =CAISSA.FUND.MARKETVALUE.SUCCESS(). 
   This makes a web request that takes 5 seconds. The call returns number and is shown in the excel cell.

Code for custom functions is located in \src\Caissa.ExcelAddin\CustomFunctions\src\functions.ts

Code for 2 Data Service Calls in located in \src\Caissa.ExcelAddin\Controllers\DataController.cs
  
