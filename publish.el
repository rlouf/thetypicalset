;; Set the package installation directory so that packages aren't stored in the
;; ~/.emacs.d/elpa path.
;; Courtesy of https://systemcrafters.net/publishing-websites-with-org-mode/building-the-site/
(require 'package)
(setq package-user-dir (expand-file-name "./.packages"))
(setq package-archives '(("melpa" . "https://melpa.org/packages/")
                         ("elpa" . "https://elpa.gnu.org/packages/")))

;; Initialize the package system
(package-initialize)
(unless package-archive-contents
  (package-refresh-contents))

;; Install dependencies
(package-install 'htmlize)

(require 'ox-publish)

(defun my/sitemap-format-entry (entry style project)
    (format "%s [[file:%s][%s]]"
            (format-time-string "%Y-%m-%d" (org-publish-find-date entry project))
            entry
            (org-publish-find-title entry project)))

(setq org-html-validation-link nil)

(setq org-publish-project-alist
      '(
         ;; The digital garden
         ("notes"
          :author "Rémi Louf"
          :email "remi@thetypicalset.com"
          :with-email t
          :base-directory "posts/"
          :base-extension "org"
          :with-date t
          :publishing-directory "_public/"
          :recursive f
          :html-head-extra "<link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\" />"
          :section-numbers nil
          :publishing-function org-html-publish-to-html
          :htmlized-source t
          :with-toc nil
          :auto-sitemap t ;; Recent changes
          :sitemap-title "The typical set"
          :sitemap-filename "recent.org"
          :sitemap-format-entry my/sitemap-format-entry
          :sitemap-sort-files anti-chronologically
          :sitemap-file-entry-format "%d - %t"
          :sitemap-style list)

        ;; Blog
        ("blog"
         :author "Rémi Louf"
         :email "remi@thetypicalset.com"
          :with-email t
         :base-directory "posts/blog"
         :base-extension "org"
         :with-date t
         :publishing-directory "_public/blog"
         :recursive nil
         :publishing-function org-html-publish-to-html
         :html-head-extra "<link rel=\"stylesheet\" type=\"text/css\" href=\"../style.css\" />"
         :section-numbers nil
         :htmlized-source t
          :with-toc nil
         :auto-sitemap t
         :sitemap-title "📅 Time-stamped thoughts"
         :sitemap-filename "index.org"
         :sitemap-format-entry my/sitemap-format-entry
         :sitemap-sort-files anti-chronologically
         :sitemap-file-entry-format "%d - %t"
         :sitemap-style list)

        ; All figures, javascript scipts, etc linked to posts
        ("static"
        :base-directory "posts"
        :base-extension "css\\|js\\|png\\|jpg\\|gif\\|pdf\\|mp3\\|ogg\\|swf"
        :publishing-directory "_public/"
        :recursive t
        :publishing-function org-publish-attachment
        )
        ; Te website's css
        ("css"
        :base-directory "css"
        :base-extension "css"
        :publishing-directory "_public/"
        :recursive t
        :publishing-function org-publish-attachment
        )
        ("org" :components ("blog" "static" "css"))))
