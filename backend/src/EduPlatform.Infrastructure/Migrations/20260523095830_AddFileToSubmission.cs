using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFileToSubmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "Submissions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "FileUrl",
                table: "Submissions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileName",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "FileUrl",
                table: "Submissions");
        }
    }
}
