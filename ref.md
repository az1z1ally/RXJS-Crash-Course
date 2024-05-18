RXJS (Reactive extension for JS) - Is a library for reactive programming using observables that makes it easier to compose asynchronous or callback based code.

Observables - collection of items over time
- Unlike array, it does'nt retain items
- emitted items can be observed over time
- A single observable can emit multiple data(at 1s mark, then 10s later etc.)

example:
If you are creating a program to keep track of keystrokes you can keep them in the array
Array: [R,X,J,S]
Observable: they will be kind of occuring over time but you can't ask let say for the 3rd one


### Git unstaging
unstage changes in Git, there are a couple of ways to do it. Let me explain them:

1. `git reset HEAD <file>:` This command unstages any modifications made to a specific file since the last commit. It doesn’t revert the changes in the filesystem, but it removes the file from the staging area. Essentially, it undoes the staging of changes for that file1.

2. `git rm --cached <file>:` This command stops tracking a file completely, leaving it in the filesystem but removing it from the repository. If the file was already committed before, it stages the removal of the file(s) from the repo. However, it leaves the file in your working tree, making it an untracked file1