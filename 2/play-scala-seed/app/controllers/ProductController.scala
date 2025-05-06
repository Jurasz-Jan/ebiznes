package controllers

import javax.inject._
import play.api.mvc._
import play.api.libs.json._
import models._

@Singleton
class ProductController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {
  var products = scala.collection.mutable.ListBuffer(
    Product(1, "Laptop", 2999.99),
    Product(2, "Telefon", 1999.99)
  )

  implicit val productFormat: OFormat[Product] = Json.format[Product]


  def getAll = Action {
    Ok(Json.toJson(products))
  }

  def getById(id: Long) = Action {
    products.find(_.id == id).map(p => Ok(Json.toJson(p))).getOrElse(NotFound)
  }

  def add = Action(parse.json) { (req: Request[JsValue]) =>
    req.body.validate[Product].map { product =>
      products += product
      Created(Json.toJson(product))
    }.getOrElse(BadRequest)
  }

 def update(id: Long) = Action(parse.json) { (req: Request[JsValue]) =>
    products.indexWhere(_.id == id) match {
      case -1 => NotFound
      case idx =>
        val updated = req.body.as[Product]
        products.update(idx, updated)
        Ok(Json.toJson(updated))
    }
  }

  def delete(id: Long) = Action {
    products.indexWhere(_.id == id) match {
      case -1 => NotFound
      case idx =>
        products.remove(idx)
        NoContent
    }
  }
}
