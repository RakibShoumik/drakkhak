<?php
/* The first login. Only a one-way hash lives here, never the password itself.
   Changing the password in the panel writes to the data folder, which a
   re-upload of the site does not touch. */
return array('user' => 'Shoumik', 'hash' => '$2y$11$fRjXeTKghRiWIxnjatzlA.1RAewz7Fd3k2gLYEKXtnLKL0hvBjOwS');
