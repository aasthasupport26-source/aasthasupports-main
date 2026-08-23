const products = [
  { name: "Natural 1 Mukhi Rudraksha", description: "Desc", category: "rudraksha" },
  { name: "Copper Shree Yantra", description: "", category: "yantra" },
];

const search = "Rudraksha";
const selectedCategory = "all";

const filteredProducts = products.filter((product) => {
  const matchesSearch =
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
  const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
  return matchesSearch && matchesCategory;
});

console.log(filteredProducts);
