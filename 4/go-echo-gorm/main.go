// main.go
package main

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

// MODELE

type Product struct {
	gorm.Model
	Name       string
	Price      float64
	CategoryID uint
	Category   Category
}

type Category struct {
	gorm.Model
	Name     string
	Products []Product
}

type Cart struct {
	gorm.Model
	UserID   uint
	Products []Product `gorm:"many2many:cart_products;"`
}

type User struct {
	gorm.Model
	Name  string
	Email string
}

type Order struct {
	gorm.Model
	UserID uint
	Total  float64
}

// SCOPES

func FilterByCategory(categoryID uint) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("category_id = ?", categoryID)
	}
}

func ExpensiveProducts(minPrice float64) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("price >= ?", minPrice)
	}
}

// HANDLERY

func CreateProduct(c echo.Context) error {
	var product Product
	if err := c.Bind(&product); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	db.Create(&product)
	fmt.Println("✔ Produkt dodany:", product.Name)
	return c.JSON(http.StatusCreated, product)
}

func GetProducts(c echo.Context) error {
	var products []Product
	query := db.Preload("Category")

	if cat := c.QueryParam("category"); cat != "" {
		if id, err := strconv.Atoi(cat); err == nil {
			query = query.Scopes(FilterByCategory(uint(id)))
		}
	}

	if min := c.QueryParam("minPrice"); min != "" {
		if val, err := strconv.ParseFloat(min, 64); err == nil {
			query = query.Scopes(ExpensiveProducts(val))
		}
	}

	query.Find(&products)
	fmt.Println("📦 Liczba produktów:", len(products))
	return c.JSON(http.StatusOK, products)
}

func CreateCart(c echo.Context) error {
	var cart Cart
	if err := c.Bind(&cart); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	db.Create(&cart)
	fmt.Println("🛒 Koszyk dodany (UserID):", cart.UserID)
	return c.JSON(http.StatusCreated, cart)
}

func CreateCategory(c echo.Context) error {
	var category Category
	if err := c.Bind(&category); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	db.Create(&category)
	fmt.Println("📁 Kategoria dodana:", category.Name)
	return c.JSON(http.StatusCreated, category)
}

func GetCategories(c echo.Context) error {
	var categories []Category
	db.Preload("Products").Find(&categories)
	fmt.Println("📂 Liczba kategorii:", len(categories))
	return c.JSON(http.StatusOK, categories)
}

func seedData() {
	cat1 := Category{Name: "Elektronika"}
	cat2 := Category{Name: "Książki"}
	db.Create(&cat1)
	db.Create(&cat2)

	db.Create(&Product{Name: "Laptop", Price: 4200, CategoryID: cat1.ID})
	db.Create(&Product{Name: "Smartfon", Price: 2800, CategoryID: cat1.ID})
	db.Create(&Product{Name: "Programowanie w Go", Price: 99, CategoryID: cat2.ID})

	db.Create(&User{Name: "Jan Kowalski", Email: "jan@example.com"})
	db.Create(&User{Name: "Anna Nowak", Email: "anna@example.com"})

	fmt.Println("🌱 Dane startowe zostały dodane")
}

func main() {
	var err error
	db, err = gorm.Open(sqlite.Open("app.db"), &gorm.Config{})
	if err != nil {
		panic("❌ Nie udało się połączyć z bazą danych")
	}
	db.AutoMigrate(&Product{}, &Category{}, &Cart{}, &User{}, &Order{})
	fmt.Println("✅ Baza danych zainicjalizowana i zmigrowana")

	seedData()

	e := echo.New()
	e.POST("/products", CreateProduct)
	e.GET("/products", GetProducts)
	e.POST("/carts", CreateCart)
	e.POST("/categories", CreateCategory)
	e.GET("/categories", GetCategories)

	fmt.Println("🚀 Serwer uruchomiony na http://localhost:8081")
	e.Logger.Fatal(e.Start(":8081"))
}
