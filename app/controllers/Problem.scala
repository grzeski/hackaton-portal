package controllers

import org.squeryl.PrimitiveTypeMode._
import play.api.mvc._
import model.Model
import play.api.data._
import play.api.data.Forms._


object Problem extends Controller with securesocial.core.SecureSocial {
    
    val problemForm = Form(
        mapping(
          "name"     -> nonEmptyText,
          "description"      -> nonEmptyText,
          "submitterId"  -> longNumber,
          "hackathonId" -> longNumber
        )(model.Problem.apply)(model.Problem.unapply)
      )
    
    def index = UserAwareAction { implicit request =>
      transaction {
        val users:Map[Long, String] = Model.users.toList.map({ u => (u.id, u.name) }).toMap
        Ok(views.html.problems.index(Model.problems.toList, users, request.user))
      }
        
    }

    def view(id: Long) = UserAwareAction { implicit request =>
      transaction {
        val users:Map[Long, String] = Model.users.toList.map({ u => (u.id, u.name) }).toMap
        Ok(views.html.problems.view(Model.problems.lookup(id), users, request.user))
      }
    }
    
    def create = SecuredAction() { implicit request =>
      transaction {
        Ok(views.html.problems.create(problemForm, Model.users.toList, Model.hackathons.toList, request.user))
      }
    }
    
    def save = SecuredAction() { implicit request =>
      problemForm.bindFromRequest.fold(
        errors =>  transaction {
          BadRequest(views.html.problems.create(errors, Model.users.toList, Model.hackathons.toList, request.user))
        },
        problem => transaction {
          Model.problems.insert(problem)
          Redirect(routes.Problem.index).flashing("status" -> "problems.added")
        }
      )
    }
    
    def edit(id: Long) = SecuredAction() { implicit request =>
      transaction {
        Model.lookupProblem(id).map { problem =>
          Ok(views.html.problems.edit(id, problemForm.fill(problem), Model.users.toList, Model.hackathons.toList, request.user))
        }.get
      }
      
    }
    
    def update(id: Long) = SecuredAction() { implicit request =>
      problemForm.bindFromRequest.fold(
        errors =>  transaction {
          BadRequest(views.html.problems.edit(id, errors, Model.users.toList, Model.hackathons.toList, request.user))
        },
        problem => transaction {
          Model.problems.update(p =>
            where(p.id === id)
            set(
                p.name := problem.name,
                p.description := problem.description,
                p.submitterId := problem.submitterId,
                p.hackathonId := problem.hackathonId
            )
  		)
          Redirect(routes.Problem.index).flashing("status" -> "problems.updated",
          									 "title" -> problem.name)
        }
      )
      
    }
    
    def delete(id: Long) = SecuredAction() { implicit request => 
        transaction {
          Model.problems.deleteWhere(p => p.id === id)
        }
        Redirect(routes.Problem.index).flashing("status" -> "problems.deleted")
    }
}