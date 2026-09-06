const fs = require("fs");
const path = require("path");

const files = [
  "admin.leads.tsx",
  "admin.users.tsx",
  "admin.products.tsx",
  "admin.categories.tsx",
  "admin.temples.tsx",
  "admin.orders.tsx",
  "admin.pujas.tsx",
  "admin/customers.tsx",
  "admin/bookings.tsx",
  "admin/index.tsx"
];

for (const file of files) {
  const p = path.join(__dirname, "src/routes", file);
  if (!fs.existsSync(p)) continue;
  
  let content = fs.readFileSync(p, "utf-8");
  
  // regex to match the beforeLoad block
  content = content.replace(/\s*beforeLoad:\s*async\s*\(\{\s*context\s*\}\)\s*=>\s*\{\s*const\s*\{\s*isAdmin\s*\}\s*=\s*context\.auth\s*\|\|\s*\{\};\s*if\s*\(!isAdmin\)\s*\{\s*throw\s*new\s*Error\("Unauthorized"\);\s*\}\s*\},/, "");
  
  fs.writeFileSync(p, content, "utf-8");
  console.log(`Updated ${file}`);
}
