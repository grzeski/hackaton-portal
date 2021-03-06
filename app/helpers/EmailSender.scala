package helpers

import model.Hackathon
import model.Team
import play.api.Play.current
import play.api.i18n.Messages
import plugins.emailnotifier.EmailNotifierPlugin
import plugins.use
import play.api.Play
import model.Problem

object EmailSender {

  private val from = Play.current.configuration.getString("application.noReply").get
  private val emailNotifierService = use[EmailNotifierPlugin].emailNotifierService

  def sendEmailToHackathonOrganiser(hackathon: Hackathon, subject: String, body: String, params: Seq[String] = Seq()) = {
    val mailBody = Messages(body, params:_*)
    val mailSubject = Messages(subject, params:_*)

    emailNotifierService.send(from, hackathon.organiser.email, mailSubject, mailBody, Some(mailBody))
  }

  def sendEmailToProblemSubmitter(problem: Problem, subject: String, body: String, params: Seq[String] = Seq()) = {
    val mailBody = Messages(body, params:_*)
    val mailSubject = Messages(subject, params:_*)

    emailNotifierService.send(from, problem.submitter.email, mailSubject, mailBody, Some(mailBody))
  }
  
  def sendEmailToTeamCreator(team: Team, subject: String, body: String, params: Seq[String] = Seq()) = {
    val mailBody = Messages(body, params:_*)
    val mailSubject = Messages(subject, params:_*)

    emailNotifierService.send(from, team.creator.email, mailSubject, mailBody, Some(mailBody))
  }

  def sendEmailToWholeTeam(team: Team, subject: String, body: String, params: Seq[String] = Seq()) = {
    val mailBody = Messages(body, params:_*)
    val mailSubject = Messages(subject, params:_*)

    val emails = Seq(team.creator.email) ++ team.members.map { _.email }

    emails.distinct.map { to =>
      emailNotifierService.send(from, to, mailSubject, mailBody, Some(mailBody))
    }
  }

}