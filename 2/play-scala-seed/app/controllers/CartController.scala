package controllers

import javax.inject._
import play.api.mvc._
import play.api.libs.json._
import models._

@Singleton
class CartController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

  var carts = scala.collection.mutable.ListBuffer(
    Cart(1, List(1, 2)),
    Cart(2, List(2))
  )

  implicit val cartFormat: OFormat[Cart] = Json.format[Cart]

  def getAll = Action {
    Ok(Json.toJson(carts))
  }

  def getById(id: Long) = Action {
    carts.find(_.id == id)
      .map(cart => Ok(Json.toJson(cart)))
      .getOrElse(NotFound)
  }

  def add = Action(parse.json) { (req: Request[JsValue]) =>
    req.body.validate[Cart].map { cart =>
      carts += cart
      Created(Json.toJson(cart))
    }.getOrElse(BadRequest)
  }

  def update(id: Long) = Action(parse.json) { (req: Request[JsValue]) =>
    carts.indexWhere(_.id == id) match {
      case -1 => NotFound
      case idx =>
        val updated = req.body.as[Cart]
        carts.update(idx, updated)
        Ok(Json.toJson(updated))
    }
  }

  def delete(id: Long) = Action {
    carts.indexWhere(_.id == id) match {
      case -1 => NotFound
      case idx =>
        carts.remove(idx)
        NoContent
    }
  }
}
