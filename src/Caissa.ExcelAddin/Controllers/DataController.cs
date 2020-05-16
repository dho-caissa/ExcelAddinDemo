using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Caissa.ExcelAddin.Controllers
{
    public class DataController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public async Task<decimal?> GetDataFailed()
        {
            Thread.Sleep(70000);
            return 999;
        }

        public async Task<decimal?> GetDataSuccess()
        {
            Thread.Sleep(5000);
            return 999;
        }
    }
}
