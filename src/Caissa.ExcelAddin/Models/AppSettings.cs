using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Caissa.ExcelAddin.Models
{
    public class AppSettings
    {
        public string ApiEndpoint { get; set; }
        public string IdentityServerEndpoint { get; set; }
        public Dictionary<string,string> Arc { get; set; } //= new Dictionary<string, string>();
    }
}
