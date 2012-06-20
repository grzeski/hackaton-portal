package controllers

import org.squeryl.PrimitiveTypeMode._
import play.api.mvc._
import model.Model
import play.api.data._
import play.api.data.Forms._


object Problem extends Controller {
    
    val problemForm = Form(
        mapping(
          "name"     -> nonEmptyText,
          "description"      -> nonEmptyText,
          "submitterId"  -> longNumber,
          "hackathonId" -> longNumber
        )(model.Problem.apply)(model.Problem.unapply)
      )
    
    def index = Action { implicit request =>
        transaction {
            val users:Map[Long, String] = Model.users.toList.map({ u => (u.id, u.name) }).toMap
            Ok(views.html.problems.index(Model.problems.toList, users))
        }
        
    }
    
    def view(id: Long) = Action { implicit request =>
        transaction {
            val users:Map[Long, String] = Model.users.toList.map({ u => (u.id, u.name) }).toMap
            Ok(views.html.problems.view(Model.problems.lookup(id), users))
        }
    }
    
    def create = Action { implicit request =>
        transaction {
            Ok(views.html.problems.create(problemForm, Model.users.toList, Model.hackathons.toList))
        }
    }
    
    def save = Action { implicit request =>
        problemForm.bindFromRequest.fold(
          errors =>  transaction {
            BadRequest(views.html.problems.create(errors, Model.users.toList, Model.hackathons.toList))
          },
          problem => transaction {
            Model.problems.insert(problem)
            Redirect(routes.Problem.index).flashing("status" -> "Problem added")
          }
        )
      }
    
    def edit(id: Long) = TODO
    
    def update(id: Long) = TODO
    
    def delete(id: Long) = Action { implicit request => 
        transaction {
          Model.problems.deleteWhere(p => p.id === id)
        }
        Redirect(routes.Problem.index).flashing("status" -> "Problem deleted")
    }
}