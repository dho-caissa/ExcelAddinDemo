using Caissa.ExcelAddin.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using System.IO;

namespace Caissa.ExcelAddin
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
           var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddEnvironmentVariables()
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true)
                .AddJsonFile("secrets/web.secrets.json", optional: true)
                .AddUserSecrets<Startup>()
                .AddEnvironmentVariables();

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddHealthChecks();
            services.Configure<AppSettings>(Configuration.GetSection("AppSettings"));
            services
                .AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Latest);

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseHealthChecks("/healthz");
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseCors(opt =>
            {
                opt.AllowAnyOrigin();
                opt.AllowAnyMethod();
                opt.AllowAnyHeader();
               // opt.AllowCredentials();
            });

            app.UseStaticFiles();



            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.Map("/customfunctions", opt =>
            {
                //if (env.IsDevelopment())
                //{
                //    opt.UseSpa(spa =>
                //    {
                //        spa.UseProxyToSpaDevelopmentServer("https://localhost:3000");
                //    });
                //}
                //else
                //{
                    var staticPath = Path.Combine(Directory.GetCurrentDirectory(),"CustomFunctions");

                    opt.UseSpaStaticFiles(new StaticFileOptions
                    {
                        FileProvider = new PhysicalFileProvider(staticPath)
                    });
                //}



            });

            app.UseSpaStaticFiles();
            //app.UseSpa(spa =>
            //{
            //    spa.UseProxyToSpaDevelopmentServer("https://localhost:3000");
            //});


            //app.Map("/", opt =>
            //{
            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";
                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
            //});


        }
    }
}
