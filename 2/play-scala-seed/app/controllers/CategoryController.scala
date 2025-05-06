package controllers

import javax.inject._
import play.api.mvc._
import play.api.libs.json._
import models._

@Singleton
class CategoryController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

  var categories = scala.collection.mutable.ListBuffer(
    Category(1, "Elektronika", "Urządzenia elektroniczne"),
    Category(2, "Książki", "Literatura i edukacja")
  )

  implicit val categoryFormat: OFormat[Category] = Json.format[Category]

  def getAll = Action {
    Ok(Json.toJson(categories))
  }

  def getById(id: Long) = Action {
    categories.find(_.id == id)
      .map(c => Ok(Json.toJson(c)))
      .getOrElse(NotFound)
  }

  def add = Action(parse.json) { (req: Request[JsValue]) =>
    req.body.validate[Category].map { category =>
      categories += category
      Created(Json.toJson(category))
    }.getOrElse(BadRequest)
  }

  def update(id: Long) = Action(parse.json) { (req: Request[JsValue]) =>
    categories.indexWhere(_.id == id) match {
      case -1 => NotFound
      case idx =>
        val updated = req.body.as[Category]
        categories.update(idx, updated)
        Ok(Json.toJson(updated))
    }
  }

  def delete(id: Long) = Action {
    categories.indexWhere(_.id == id) match {
      case -1 => NotFound
      case idx =>
        categories.remove(idx)
        NoContent
    }
  }
}
