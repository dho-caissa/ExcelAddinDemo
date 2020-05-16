using Caissa.ExcelAddin.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Caissa.ExcelAddin.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppSettingsController : ControllerBase
    {
        private readonly IOptions<AppSettings> _config;

        public AppSettingsController(IOptions<AppSettings> config)
        {
            _config = config;
        }
        public AppSettings Get()
        {
            return _config.Value;
        }


        
    }
}
