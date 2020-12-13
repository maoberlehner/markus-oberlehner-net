+++
date = "2019-06-16T06:41:41+02:00"
title = "Use Fragments to Avoid Obsolete GraphQL Fields in Vue.js Applications"
description = "Learn how to use component specific GraphQL fragments in Vue.js to avoid obsolete fields in your GraphQL queries."
intro = "The more I use GraphQl, the more I ask myself the following question: How can I avoid GraphQL queries which query a bunch of fields that were once needed but are no longer used because the code has changed and the fields are now obsolete..."
draft = false
categories = ["Development"]
tags = ["JavaScript", "Vue", "GraphQL"]
images = ["/images/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1532158513/blog/2019-06-16/component-specific-fragments"]
+++

The more I use GraphQl, the more I ask myself the following question: How can I avoid GraphQL queries which query a bunch of fields that were once needed but are no longer used because the code has changed and the fields are now obsolete?

## The problem

Let's take look at the following application structure. The snippet shows a component tree of a typical Vue.js application: a base component that has several levels deep of child components.

```bash
UserDashboard
 └─ UserInfo
     ├─ UserAvatar
     └─ UserBio
         ├─ UserAvatar
         └─ UserDetails
```

In our example, the `UserDashboard` component is responsible for fetching the current user and the necessary fields to render all of its child components.

```html
<template>
  <div>
    <UserInfo
      v-if="user"
      :user="user"
    />
  </div>
</template>

<script>
// src/components/UserDashboard.vue
import gql from 'graphql-tag';

import UserInfo from './UserInfo.vue';

export default {
  components: {
    UserInfo,
  },
  data() {
    return {
      user: null,
    };
  },
  apollo: {
    user: {
      query: gql`
        query Person($id: ID!) {
          Person(id: $id) {
            eyeColor
            gender
            hairColor
            name
          }
        }
      `,
      variables: {
        id: 'cj0nv9p8yewci0130wjy4o5fa',
      },
      update(data) {
        return data.Person;
      },
    },
  },
};
</script>
```

Above you can see the GraphQL query needed to get the data for the rendering of all our components. So far, so good.

Over time, our requirements change and we also want to display the height of our users on their dashboards. So we need to add a new query field.

```diff
       query: gql`
         query Person($id: ID!) {
           Person(id: $id) {
             eyeColor
             gender
             hairColor
+            height
             name
           }
         }
       `,
```

```diff
 <template>
   <div>
     Eye color: {{ user.eyeColor[0] }}
     <br>
     Hair color: {{ user.hairColor[0] }}
+    <br>
+    Height: {{ user.height }} cm
   </div>
 </template>
```

That was easy. But now imagine months going by, several developers making changes to the codebase, and one day you or one of your colleagues come back to make some changes to the `UserDetails` component. Let's say you want to remove the field again.

If you have great commit discipline and your original change was properly encapsulated in a single commit, you can even do this automatically by running `git revert 6ff35c3x`.

```diff
             gender
             hairColor
-            height
             name
           }
```

```diff
     <br>
     Hair color: {{ user.hairColor[0] }}
-    <br>
-    Height: {{ user.height }} cm
   </div>
 </template>
```

Seems straightforward at first glance, but you might very well have introduced a new bug. **The field that was originally added because it had to be rendered in `UserDetails` is now also used in one or more other subcomponents.** So if you want to remove a field from the GraphQL query, **you need to check all child components that take the result of the query as a property for possible use of the field.**

In the real world, most developers won't do that because we're busy and have a lot to do. This means that after a few months, or even more after a few years, **we will have a lot of queries in our codebase that consist of a number of fields that are no longer used anywhere,** but it's a lot of work to figure out which fields that concerns.

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about advanced Vue.js techniques?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

## A possible solution using fragments

Although I've been thinking about this problem for a few weeks now, I haven't found a solution that is 100% satisfactory. But after seeing this pattern in a few React applications, I figured it could be very useful in Vue.js as well.

### Using component specific fragments

Using fragments, each component can define the fields it needs itself, making it easier to remove obsolete fields without fear of destroying other child components that rely on the data of the same query.

```html
<template>
  <div>
    <UserInfo
      v-if="user"
      :user="user"
    />
  </div>
</template>

<script>
// src/components/UserDashboard.vue
import gql from 'graphql-tag';

import UserInfo from './UserInfo.vue';

export default {
  // ...
  apollo: {
    user: {
      query: gql`
        query Person($id: ID!) {
          Person(id: $id) {
            ...UserInfoUser
          }
        }
        ${UserInfo.fragments.user}
      `,
      // ...
    },
  },
};
</script>
```

```html
<template>
  <!-- ... -->
</template>

<script>
// src/components/UserInfo.vue
import gql from 'graphql-tag';

import UserAvatar from './UserAvatar.vue';
import UserBio from './UserBio.vue';

export default {
  // ...
  fragments: {
    user: gql`
      fragment UserInfoUser on Person {
        ...UserAvatarUser
        ...UserBioUser
      }
      ${UserAvatar.fragments.user}
      ${UserBio.fragments.user}
    `,
  },
};
</script>
```

```html
<template>
  <!-- ... -->
</template>

<script>
// src/components/UserBio.vue
import gql from 'graphql-tag';

import UserDetails from './UserDetails.vue';
import UserIntro from './UserIntro.vue';

export default {
  // ...
  fragments: {
    user: gql`
      fragment UserBioUser on Person {
        ...UserDetailsUser
        ...UserIntroUser
      }
      ${UserDetails.fragments.user}
      ${UserIntro.fragments.user}
    `,
  },
};
</script>
```

```html
<template>
  <div>
    Eye color: {{ user.eyeColor[0] }}
    <br>
    Hair color: {{ user.hairColor[0] }}
    <br>
    Height: {{ user.height }} cm
  </div>
</template>

<script>
// src/components/UserDetails.vue
import gql from 'graphql-tag';

export default {
  // ...
  fragments: {
    user: gql`
      fragment UserDetailsUser on Person {
        eyeColor
        hairColor
        height
      }
    `,
  },
};
</script>
```

As you can see in the quite complex example above, **by using fragments we manage to define fields only in components where they are used. This makes it much easier to detect and remove obsolete fields.**

Although this approach is a big step in the right direction and I think this can work very well if you don't plan to ever use anything other than GraphQL as your data fetching method of choice, there are still some drawbacks to this approach.

1. The structure of the components built in this way depends on the data format provided by your API.
2. You'll end up building components which are a lot harder to reuse because they're tightly coupled to the API.
3. You're basically tied to using GraphQL forever or completely rebuild your application from scratch if you move away from GraphQL.

**Following this approach leads to an application architecture that is heavily entangled with GraphQL.** This is a general problem I see with GraphQL. Let's be honest: **If you use this architecture and want to move away from GraphQL as the API layer at some point, you basically have to throw away your entire application and start from scratch.** This may not be a problem for your side project, but it can be a dealbreaker if you create a giant application that will be used and extended by a huge company for the next 10-15 years.

But if you're absolutely sure you'll never move away from GraphQL anyway, this seems to me like a very solid approach to solve this problem.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/use-fragments-to-avoid-obsolete-graphql-fields-in-vuejs-q2wm7?fontsize=14&module=%2Fsrc%2Fcomponents%2FUserDashboard.vue&view=editor" title="Use Fragments to Avoid Obsolete GraphQL Fields in Vue.js Applications" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like What You Read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest Vue.js articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping it up

Although GraphQL seems to be everybody's darling at the moment and I too think it's a very cool technology, its tendency to get into every corner of your application and dictate how to structure your components is something you should at least be aware of and ideally work against it. **In an ideal world, I can change my data fetching layer without touching any of my components. GraphQL makes this almost impossible.**

In addition to using fragments as described in this article, **I also try not to pass objects as properties whenever I can.** This makes my components 100% independent from the API layer and also makes them more explicit about what data they expect.

## References

- [Relay Docs, Using Fragments](https://relay.dev/docs/en/quick-start-guide#using-fragments)
- [Apollo Docs, Colocating fragments](https://www.apollographql.com/docs/react/advanced/fragments/#colocating-fragments)
